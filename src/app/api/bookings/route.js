import prisma from '@/app/lib/prisma'

const SECRET_KEY = 'LotusKey'

function formatDateToLocal(date) {
    const offsetMs = 7 * 60 * 60 * 1000 // +7 jam GMT+7
    const localDate = new Date(date.getTime() + offsetMs)
    return localDate.toISOString().slice(0, 10)
}

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
    const allowedWithSecret = getDateRange(today, 3, 7)
    const allowedWithoutSecret = getDateRange(today, 1, 2)

    const bookingDateStr = formatDateToLocal(bookingDate)

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

    const bookings = await prisma.booking.findMany({
        where: { date },
        select: { hour: true, name: true, address: true, olahraga: true },
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
