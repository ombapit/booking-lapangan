'use client'
import { useState, useEffect } from 'react'

const hours = Array.from({ length: 18 }, (_, i) => `${6 + i}:00`)

export default function TimeSlots({ date }) {
    const [showDetails, setShowDetails] = useState(false)
    const [selectedHours, setSelectedHours] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: '', address: '', olahraga: '', password: '', secret: '' })
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)

    const dateStr = date.toISOString().split('T')[0]

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const key = params.get('key')
        if (key === 'LotusKey') {
            setShowDetails(true)
        }
    }, [])

    useEffect(() => {
        fetchBookings()
    }, [dateStr])

    const fetchBookings = async () => {
        const res = await fetch(`/api/bookings?date=${dateStr}`)
        const data = await res.json()
        setBookings(data.bookings || [])
    }

    const toggleHour = (hour) => {
        const hourNumber = parseInt(hour.split(':')[0])

        if (selectedHours.includes(hour)) {
            setSelectedHours(selectedHours.filter(h => h !== hour))
        } else {
            if (selectedHours.length === 0) {
                setSelectedHours([hour])
            } else {
                const selectedHourNumbers = selectedHours.map(h => parseInt(h.split(':')[0]))
                const min = Math.min(...selectedHourNumbers)
                const max = Math.max(...selectedHourNumbers)

                if (hourNumber === max + 1 || hourNumber === min - 1) {
                    if (selectedHours.length >= 3) {
                        alert('Maksimal 3 jam berturut-turut.')
                    } else {
                        setSelectedHours([...selectedHours, hour])
                    }
                } else {
                    alert('Jam harus berurutan.')
                }
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: dateStr,
                    hours: selectedHours,
                    ...form,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                alert('Booking berhasil.')
                setShowForm(false)
                setSelectedHours([])
                setForm({ name: '', address: '', olahraga: '', password: '', secret: '' })
                fetchBookings()
            } else {
                alert(data.error || 'Gagal booking')
            }
        } catch (err) {
            alert('Terjadi kesalahan.')
        }
        setLoading(false)
    }

    const handleDelete = async (hour, name) => {
        const password = prompt(`Masukkan password untuk hapus booking "${hour}" (${name}):`)
        if (!password) return

        const res = await fetch('/api/bookings', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: dateStr, hour, password }),
        })
        const data = await res.json()
        if (res.ok) {
            alert('Booking berhasil dihapus.')
            fetchBookings()
        } else {
            alert(data.error || 'Gagal menghapus booking')
        }
    }

    const getBookingInfo = (hour) => {
        const booking = bookings.find(b => b.hour === hour)
        if (!booking) return null
        if (showDetails) {
            return `${booking.name} (${booking.address})\n${booking.olahraga}`
        } else {
            return `Sudah dibooking\n${booking.olahraga}`
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">
                Pilih Jam: {date.toLocaleDateString('id-ID')}
            </h2>

            <div className="grid grid-cols-3 gap-2 mb-4">
                {hours.map(hour => {
                    const booking = getBookingInfo(hour)
                    const isBooked = !!booking
                    const isSelected = selectedHours.includes(hour)

                    return (
                        <div key={hour} className="relative">
                            <button
                                onClick={() => !isBooked && toggleHour(hour)}
                                disabled={isBooked}
                                className={`p-4 w-full rounded shadow text-sm ${isBooked
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : isSelected
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-green-400 hover:bg-green-500'
                                    }`}
                            >
                                {hour}
                                {booking && (
                                    <div className="text-xs mt-1 text-gray-700 whitespace-pre-line">
                                        {`${booking}`}
                                    </div>
                                )}
                            </button>
                            {isBooked && showDetails && (
                                <button
                                    onClick={() => handleDelete(hour, booking.name)}
                                    className="absolute top-0 right-0 text-red-600 text-xs p-1"
                                >
                                    ❌
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {selectedHours.length > 0 && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 mb-4"
                >
                    Booking {selectedHours.join(', ')}
                </button>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-2 bg-white p-4 rounded shadow">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Olahraga</label>
                        <select
                            value={form.olahraga}
                            onChange={(e) => setForm({ ...form, olahraga: e.target.value })}
                            required
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Pilih Olahraga</option>
                            <option value="Basket">Basket</option>
                            <option value="Tenis">Tenis</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Nama</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Alamat</label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            required
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full border p-2 rounded"
                            placeholder="Password Booking, jangan lupa!!!"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Kunci Rahasia</label>
                        <input
                            type="password"
                            value={form.secret}
                            onChange={(e) => setForm({ ...form, secret: e.target.value })}
                            className="w-full border p-2 rounded"
                            placeholder="Optional, bisa dikosongkan"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Booking'}
                    </button>
                </form>
            )}
        </div>
    )
}
