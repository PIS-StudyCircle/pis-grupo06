import { createClassEvent } from "../services/calendarApi";
import { Input } from "@components/Input";
import { useFormState } from "@utils/UseFormState";
import { useValidation } from "@hooks/useValidation";
import { validateRequired } from "@utils/validation";
import { SubmitButton } from "@components/SubmitButton";
import { showSuccess, showError } from "@utils/toastService";
import  { useNavigate  } from "react-router-dom";    

const validators = {
  title: (value) => validateRequired(value, "Título"),
  description: (value) => validateRequired(value, "Descripción", "f"),
  date: (value) => validateRequired(value, "Fecha"),
  start_time: (value) => validateRequired(value, "Hora de inicio", "f"),
  end_time: (value) => validateRequired(value, "Hora de fin", "f"),
  attendees: (value) => validateRequired(value, "Participantes"),
};

export default function AppointPage() {
  const navigate = useNavigate();
  const { form, setField } = useFormState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    attendees: "",
  });

  const { errors, validate } = useValidation(validators);

  const handleChange = (e) => {
    setField(e.target.name, e.target.value);
  };

  const toGoogleDateTime = (date, time) => {
    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");
    return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate(form)) {
      return;
    }

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
      showSuccess("¡Evento creado exitosamente!"); 
      navigate("/perfil");
    } catch (error) {
      console.error("Error al crear el evento:", error);
      showError(`Error al crear el evento: ${error.message}`); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
          Crear Evento de Clase
        </h1>
        <div
          className="bg-gradient-to-br from-white to-gray-50 
                    rounded-2xl shadow-2xl border border-gray-200 
                    p-10"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
            Detalles del Evento
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="title"
              label="Título"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Título del evento"
              className="w-full"
              error={errors.title}
            />

            <Input
              id="description"
              label="Descripción"
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción del evento"
              className="w-full"
              error={errors.description}
            />

            <Input
              id="date"
              label="Fecha"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full"
              error={errors.date}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="start_time"
                label="Hora de inicio"
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                className="w-full"
                error={errors.start_time}
              />

              <Input
                id="end_time"
                label="Hora de fin"
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                className="w-full"
                error={errors.end_time}
              />
            </div>

            <Input
              id="attendees"
              label="Participantes (emails separados por comas)"
              type="text"
              name="attendees"
              value={form.attendees}
              onChange={handleChange}
              placeholder="ejemplo1@mail.com, ejemplo2@mail.com"
              error={errors.attendees}
              className="w-full"
            />

            <div className="pt-6 flex justify-end gap-4">
              <SubmitButton
                text="Crear Evento"
                fullWidth={false}
                className="w-40"
              />
              <button
                type="button"
                onClick={() => window.history.back()}
                className="w-40 px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md 
                hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
