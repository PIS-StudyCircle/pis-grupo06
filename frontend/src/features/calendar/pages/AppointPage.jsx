import { useState } from "react";
import { createClassEvent } from "../services/calendarApi";

export default function AppointPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    attendees: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toGoogleDateTime = (date, time) => {
  const [year, month, day] = date.split("-");
  const [hours, minutes] = time.split(":");
  return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const attendeesArr = form.attendees
        .split(",")
        .map((email) => ({ email: email.trim() }))
        .filter((a) => a.email);

      const eventData = {
  title: form.title,
  description: form.description,
  start: toGoogleDateTime(form.date, form.start_time),
  end: toGoogleDateTime(form.date, form.end_time),
  attendees: attendeesArr,
};

      const event = await createClassEvent(eventData);

      console.log("Evento creado exitosamente:", event);
      alert(
        "¡Evento creado exitosamente! Revisa la consola para más detalles."
      );
    } catch (error) {
      console.error("Error al crear el evento:", error);
      alert(`Error al crear el evento: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Página de Citas - Testing
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Crear Evento
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Título
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Descripción
              </label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Fecha
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Hora de inicio
              </label>
              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Hora de fin
              </label>
              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Emails de asistentes (separados por coma)
              </label>
              <input
                type="text"
                name="attendees"
                value={form.attendees}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="ejemplo1@mail.com, ejemplo2@mail.com"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Crear Evento
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
