import prisma from '@/app/lib/prisma'

const SECRET_KEY = 'LotusKey'

// Format tanggal → WIB (UTC+7)
function formatDateToLocal(date) {
    const offsetMs = 7 * 60 * 60 * 1000 // +7 jam GMT+7
    const localDate = new Date(date.getTime() + offsetMs)
    return localDate.toISOString().slice(0, 10)
}

// Buat array tanggal dari baseDate, startOffset sampai endOffset (positif = hari ke depan)
function getDateRange(baseDate, startOffset, endOffset) {
    const result = []
    for (let i = startOffset; i <= endOffset; i++) {
        const d = new Date(baseDate)
        d.setDate(d.getDate() + i)
        result.push(formatDateToLocal(d))
    }
    return result
}

export async function POST(request) {
    const { date, hours, name, address, password, secret, olahraga } = await request.json()

    if (!date || !Array.isArray(hours) || !name || !address || !password || !olahraga) {
        return Response.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const bookingDate = new Date(date)
    if (isNaN(bookingDate)) {
        return Response.json({ error: 'Format tanggal tidak valid' }, { status: 400 })
    }

    const today = new Date()
    const todayStr = formatDateToLocal(today)
    const bookingDateStr = formatDateToLocal(bookingDate)

    const allowedWithSecret = getDateRange(today, 3, 7)     // 3 - 7 hari setelah hari ini → Dengan kunci
    const allowedWithoutSecret = getDateRange(today, 1, 2)  // 1 - 2 hari setelah hari ini → Tanpa kunci

    if (secret === SECRET_KEY) {
        if (!allowedWithSecret.includes(bookingDateStr)) {
            return Response.json(
                { error: `Dengan kunci, hanya bisa booking tanggal: ${allowedWithSecret.join(', ')}` },
                { status: 403 }
            )
        }
    } else if (!secret) {
        if (!allowedWithoutSecret.includes(bookingDateStr)) {
            return Response.json(
                { error: `Hanya bisa booking tanggal: ${allowedWithoutSecret.join(', ')}` },
                { status: 403 }
            )
        }

        // 🔸 Khusus tanpa kunci → cek apakah nama & alamat sudah booking untuk tanggal >= hari ini
        const existingByName = await prisma.booking.findFirst({
            where: {
                date: { gt: todayStr },
                name: { equals: name },
                address: { equals: address },
            },
        })

        if (existingByName) {
            return Response.json(
                { error: 'Nama & alamat sudah memiliki booking aktif, tunggu hingga booking sebelumnya lewat. Atau hapus booking aktif yang ada.' },
                { status: 409 }
            )
        }
    } else {
        return Response.json({ error: 'Kunci rahasia salah' }, { status: 401 })
    }

    const existing = await prisma.booking.findMany({
        where: {
            date,
            hour: { in: hours },
        },
        select: { hour: true },
    })

    if (existing.length > 0) {
        const existingHours = existing.map(b => b.hour)
        return Response.json(
            { error: `Jam ${existingHours.join(', ')} sudah dibooking, silakan pilih jam lain` },
            { status: 409 }
        )
    }

    const bookings = await Promise.all(
        hours.map(hour =>
            prisma.booking.create({
                data: { date, hour, olahraga, name, address, password, secret: secret || '' },
            })
        )
    )

    return Response.json({ message: 'Booking berhasil', bookings }, { status: 201 })
}

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    if (!date) return Response.json({ error: 'Parameter date wajib' }, { status: 400 })

    const key = searchParams.get('key')
    const showSensitive = key === SECRET_KEY

    const bookings = await prisma.booking.findMany({
        where: { date },
        select: showSensitive
            ? { hour: true, name: true, address: true, olahraga: true }
            : { hour: true, olahraga: true }, // Tanpa nama/alamat jika tanpa key
    })

    return Response.json({ bookings })
}

export async function DELETE(request) {
    const { date, hour, password } = await request.json()

    if (!date || !hour || !password) {
        return Response.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const booking = await prisma.booking.findFirst({
        where: { date, hour },
    })

    if (!booking) {
        return Response.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
    }

    if (booking.password !== password) {
        return Response.json({ error: 'Password salah' }, { status: 403 })
    }

    await prisma.booking.delete({
        where: { id: booking.id },
    })

    return Response.json({ message: 'Booking berhasil dihapus' }, { status: 200 })
}
