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
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-2 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col row-start-2 items-center w-full items-center">
        <h1 className='text-2xl font-bold'>Booking Lapangan Basket/Tenis</h1>
        <h2 className='font-semibold'>Lotus Palace - PIK</h2>

        <div className="flex gap-4 items-center flex-col mt-6">
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
      <footer className="row-start-3 gap-[24px] w-full flex justify-center text-red-500">
        Booking hanya bisa dilakukan 2 hari sebelum tanggal bermain.
      </footer>
    </div>
  );
}
