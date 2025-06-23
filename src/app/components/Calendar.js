'use client'

import { useState, useEffect } from 'react'
export default function Calendar({ onSelectDate }) {
    const [days, setDays] = useState([])

    useEffect(() => {
        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(today.getDate() + 1)

        const params = new URLSearchParams(window.location.search)
        const key = params.get('key')
        let num = 2;
        if (key === process.env.NEXT_PUBLIC_KEY || key === process.env.NEXT_PUBLIC_KEY2) {
            num = 7;
        }
        const locdays = Array.from({ length: num }, (_, i) => {
            const d = new Date(startDate)
            d.setDate(startDate.getDate() + i)
            return d
        })
        setDays(locdays)
    }, [])



    return (
        <div className="flex gap-2 mb-4">
            {days.map(date => (
                <button
                    key={date.toDateString()}
                    onClick={() => onSelectDate(date)}
                    className="bg-white p-2 rounded shadow text-center hover:bg-blue-100 text-fixed"
                >
                    <div className="font-bold text-lg">{date.getDate()}</div>
                    <div className="text-xs">{date.toLocaleDateString('id-ID', { weekday: 'short' })}</div>
                    <div className="text-xs">{date.toLocaleDateString('id-ID', { month: 'short' })}</div>
                </button>
            ))}
        </div>
    )
}
