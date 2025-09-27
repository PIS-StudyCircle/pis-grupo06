export default function TutorSchedulePage({ tutor }) {

  

  const availability = [
    {
      day: "Lunes",
      start: "2025-09-29T10:00:00-03:00",
      end: "2025-09-29T11:00:00-03:00",
    },
    {
      day: "Miércoles",
      start: "2025-10-01T14:00:00-03:00",
      end: "2025-10-01T15:30:00-03:00",
    },
    {
      day: "Viernes",
      start: "2025-10-03T09:00:00-03:00",
      end: "2025-10-03T10:00:00-03:00",
    },
  ];

  const daysOrder = ["lunes", "martes", "miércoles", "jueves", "viernes"];
  const orderedAvailability = [...availability].sort((a, b) => {
    const idxA = daysOrder.indexOf(a.day.toLowerCase());
    const idxB = daysOrder.indexOf(b.day.toLowerCase());
    return idxA - idxB;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Horarios Disponibles - {tutor.name}
      </h1>

      <div className="flex flex-col gap-2">
        {orderedAvailability.map((slot, idx) => {
          const prevDay = idx > 0 ? orderedAvailability[idx - 1].day : null;
          const extraMargin = prevDay && prevDay !== slot.day ? "mt-6" : "";

          return (
            <div
              key={idx}
              className={`p-4 border rounded-lg shadow bg-white ${extraMargin}`}
            >
              <p className="font-semibold">{slot.day}</p>
              <p>
                {new Date(slot.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(slot.end).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
