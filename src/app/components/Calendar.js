export default function Calendar({ onSelectDate }) {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + 1)

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate)
        d.setDate(startDate.getDate() + i)
        return d
    })

    return (
        <div className="grid grid-cols-7 gap-2 mb-4">
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
