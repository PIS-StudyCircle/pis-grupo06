import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useUser } from "@/features/users/hooks/user_context";

// Configurar moment en español
moment.locale("es");
const localizer = momentLocalizer(moment);

export default function TutorCalendarPage() {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Datos de ejemplo para horarios de tutoría
  useEffect(() => {
    // Simulamos una carga de datos
    setTimeout(() => {
      const sampleEvents = [
        {
          id: 1,
          title: "Tutoría - Matemáticas I",
          start: new Date(2025, 8, 28, 10, 0),
          end: new Date(2025, 8, 28, 11, 0),
          student: "Juan Pérez",
          subject: "Matemáticas I",
          status: "confirmada",
        },
        {
          id: 2,
          title: "Tutoría - Física II",
          start: new Date(2025, 8, 29, 14, 0),
          end: new Date(2025, 8, 29, 15, 30),
          student: "María García",
          subject: "Física II",
          status: "pendiente",
        },
        {
          id: 3,
          title: "Horario Disponible",
          start: new Date(2025, 8, 30, 16, 0),
          end: new Date(2025, 8, 30, 18, 0),
          type: "available",
          status: "disponible",
        },
      ];
      setEvents(sampleEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCreateAvailability = () => {
    if (selectedSlot) {
      const newEvent = {
        id: Date.now(),
        title: "Horario Disponible",
        start: selectedSlot.start,
        end: selectedSlot.end,
        type: "available",
        status: "disponible",
      };
      setEvents([...events, newEvent]);
    }
    setShowModal(false);
    setSelectedSlot(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
    }
    setShowModal(false);
    setSelectedEvent(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad";
    let color = "white";

    if (event.status === "confirmada") {
      backgroundColor = "#28a745";
    } else if (event.status === "pendiente") {
      backgroundColor = "#ffc107";
      color = "black";
    } else if (event.status === "disponible") {
      backgroundColor = "#17a2b8";
    }

    return {
      style: {
        backgroundColor,
        color,
        borderRadius: "4px",
        border: "none",
        fontSize: "12px",
      },
    };
  };

  const messages = {
    allDay: "Todo el día",
    previous: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "No hay eventos en este rango",
    showMore: (total) => `+ Ver más (${total})`,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando calendario...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Mi Calendario de Tutorías
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus horarios y sesiones de tutoría
            </p>
          </div>

          {/* Leyenda */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Leyenda:</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm">Confirmada</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                <span className="text-sm">Pendiente</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm">Disponible</span>
              </div>
            </div>
          </div>

          {/* Calendario */}
          <div className="bg-white rounded-lg shadow p-6">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              messages={messages}
              views={["month", "week", "day"]}
              defaultView="week"
              step={30}
              timeslots={2}
            />
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {selectedSlot && (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Crear Horario Disponible
                </h2>
                <div className="mb-4">
                  <p className="text-gray-600">
                    <strong>Inicio:</strong>{" "}
                    {moment(selectedSlot.start).format("DD/MM/YYYY HH:mm")}
                  </p>
                  <p className="text-gray-600">
                    <strong>Fin:</strong>{" "}
                    {moment(selectedSlot.end).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateAvailability}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Crear Disponibilidad
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {selectedEvent && (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Detalle del Evento
                </h2>
                <div className="mb-4 space-y-2">
                  <p>
                    <strong>Título:</strong> {selectedEvent.title}
                  </p>
                  <p>
                    <strong>Inicio:</strong>{" "}
                    {moment(selectedEvent.start).format("DD/MM/YYYY HH:mm")}
                  </p>
                  <p>
                    <strong>Fin:</strong>{" "}
                    {moment(selectedEvent.end).format("DD/MM/YYYY HH:mm")}
                  </p>
                  {selectedEvent.student && (
                    <p>
                      <strong>Estudiante:</strong> {selectedEvent.student}
                    </p>
                  )}
                  {selectedEvent.subject && (
                    <p>
                      <strong>Materia:</strong> {selectedEvent.subject}
                    </p>
                  )}
                  <p>
                    <strong>Estado:</strong>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedEvent.status === "confirmada"
                          ? "bg-green-100 text-green-800"
                          : selectedEvent.status === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedEvent.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  {selectedEvent.type === "available" && (
                    <button
                      onClick={handleDeleteEvent}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                    >
                      Eliminar Disponibilidad
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
