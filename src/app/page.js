'use client'
import { useState } from 'react';
import Calendar from "./components/Calendar";
import TimeSlots from "./components/TimeSlots";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [bookings, setBookings] = useState({})

  const handleBooking = (date, hour) => {
    setBookings(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), hour]
    }))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-2 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center w-full flex-1">
        <h1 className="font-bold text-lg">Booking Lapangan Basket/Tenis</h1>
        <h2 className="font-semibold text-base">Lotus Palace - PIK</h2>

        <div className="flex flex-col gap-4 items-center mt-6 w-full max-w-md">
          <Calendar onSelectDate={setSelectedDate} />

          {selectedDate && (
            <TimeSlots
              date={selectedDate}
              bookings={bookings}
              onBook={handleBooking}
            />
          )}
        </div>
      </main>

      <footer className="text-xs text-red-500 py-2 text-center">
        Booking hanya bisa dilakukan 2 hari sebelum tanggal bermain.
      </footer>
    </div>
  );
}
