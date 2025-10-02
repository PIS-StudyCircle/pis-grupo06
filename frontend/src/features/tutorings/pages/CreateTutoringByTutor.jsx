import { useParams } from "react-router-dom";
import { useUser } from "@context/UserContext"; 
import { useCourse } from "../../courses/hooks/useCourse";
import { createTutoringByTutor } from "../services/tutoringService";

import { AuthLayout } from "../../users/components/AuthLayout.jsx";
import { Input } from "@components/Input";
import { ErrorAlert } from "@components/ErrorAlert";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import {
  validateRequired,
  validateDate,
  validateHoursTutoring,
  validateInteger,
} from "@utils/validation";
import { useValidation } from "@hooks/useValidation";
import { useFormSubmit } from "@utils/UseFormSubmit";

const validators = {
  date: (value) => validateDate(value, "Fecha de inicio"),
  start_time: (value) => validateRequired(value, "Hora de inicio"),
  end_time: (value, form) => {
    const required = validateRequired(value, "Hora de fin");
    if (required) return required;
    // Solo valida relación si ambas horas están presentes
    if (form.date && form.start_time && form.end_time) {
      return validateHoursTutoring(form.date, form.start_time, form.end_time);
    }
    return null;
  },
  limit: (value) => validateInteger(value, "Límite de estudiantes"),
};

export default function CreateTutoringByTutor() {
  const { user, userLoading, userError } = useUser(); 

  const { courseId } = useParams();
  const { course, loadingCourse, errorCourse } = useCourse(courseId);

  const selectedSubjects = JSON.parse(localStorage.getItem("selectedSubjects")) || [];

  const { form, setField } = useFormState({
    date: "",
    start_time: "",
    end_time: "",
    mode: "virtual",
    limit: "20",
    location: "",
  });

  const { errors, validate } = useValidation(validators);
  const { error, onSubmit } = useFormSubmit(createTutoringByTutor, "/perfil");

  if (userLoading) return <p className="text-center mt-10">Cargando usuario...</p>;
  if (userError) return <p className="text-center mt-10">Error al cargar perfil.</p>;
  if (!user) return <p className="text-center mt-10">No hay usuario cargado.</p>;

  if (loadingCourse) return <p className="text-center mt-10">Cargando curso...</p>;
  if (errorCourse) return <p className="text-center mt-10">Error al cargar el curso.</p>;
  if (!course) return <p className="text-center mt-10">No hay curso cargado.</p>;
    
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(form)) {
      // Crea el objeto Date en la zona local
      const localDate = new Date(`${form.date}T${form.start_time}:00`);
      // Convierte a ISO string (UTC)
      const scheduled_at = localDate.toISOString();

      const [startH, startM] = form.start_time.split(":").map(Number);
      const [endH, endM] = form.end_time.split(":").map(Number);
      const duration_mins = (endH * 60 + endM) - (startH * 60 + startM);

      const payload = {
        scheduled_at,
        duration_mins,
        modality: form.mode,
        capacity: parseInt(form.limit, 10),
        creator_id: user.id,
        tutor_id: user.id,
        course_id: course.id,
        subject_ids: selectedSubjects,
        location: form.mode === "presencial" ? form.location : "",
      };
      onSubmit(payload);
      localStorage.removeItem("selectedSubjects");
    }
  };

  return (
    <AuthLayout
      title={`Tutoría para ${course.name}`}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        <div className="flex flex-col text-left">
          <label
            htmlFor="date"
            className="text-gray-600 text-xs font-medium mb-1"
          >
            Fecha
          </label>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
            className="p-1 border rounded-md text-sm"
          />
          {errors.date && (
            <span className="text-red-500 text-xs mt-1">
              {errors.date}
            </span>
          )}
        </div>

        <div>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col flex-1">
              <label
                htmlFor="start_time"
                className="text-gray-600 text-xs font-medium mb-1"
              >
                Hora de inicio
              </label>
              <input
                id="start_time"
                type="time"
                value={form.start_time}
                onChange={(e) => setField("start_time", e.target.value)}
                className="p-1 border rounded-md text-sm"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label
                htmlFor="end_time"
                className="text-gray-600 text-xs font-medium mb-1"
              >
                Hora de fin
              </label>
              <input
                id="end_time"
                type="time"
                value={form.end_time}
                onChange={(e) => setField("end_time", e.target.value)}
                className="p-1 border rounded-md text-sm"
              />
            </div>
          </div>
          {errors.start_time && (
            <span className="text-red-500 text-xs">{errors.start_time}</span>
          )}
          {!errors.start_time && errors.end_time && (
            <span className="text-red-500 text-xs">{errors.end_time}</span>
          )}
        </div>
 
        <div className="flex items-center gap-4">
          <span className="font-medium">Modalidad:</span>
          <button
            type="button"
            className={`px-4 py-2 rounded font-medium transition-colors ${
              form.mode === "virtual"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setField("mode", "virtual")}
          >
            Virtual
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded font-medium transition-colors ${
              form.mode === "presencial"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setField("mode", "presencial")}
          >
            Presencial
          </button>
        </div>

        {form.mode === "presencial" && (
          <div className="flex flex-col text-left">
            <label htmlFor="location" className="text-gray-600 text-xs font-medium mb-1">
              Lugar de la tutoría (opcional)
            </label>
            <textarea
              id="location"
              rows={2}
              maxLength={255}
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              className="p-2 border rounded-md text-sm"
              placeholder="Ej.: Departamento, Ciudad, Calle."
            />
            <div className={`text-xs mt-1 ${form.location.length === 255 ? "text-red-600" : "text-gray-500"}`}>
              {form.location.length}/{255}
            </div>
            {form.location.length > 255 && (
              <span className="text-red-500 text-xs mt-1">Máximo 255 caracteres.</span>
            )}
          </div>
        )}

        <div className="flex items-center">
          <span className="font-medium mr-2">Cupos:</span>
          <Input
            id="limit"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.limit}
            onChange={(e) => setField("limit", e.target.value.replace(/[^0-9]/g, ""))}
            error={errors.limit}
            className="flex-1"
            autoComplete="off"
          />
        </div>

        {error.length > 0 && (
          <ErrorAlert>
            {error.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </ErrorAlert>
        )}

        <SubmitButton text="Confirmar" />
      </form>
    </AuthLayout>
  );
}