import { useParams } from "react-router-dom";
import { useUser } from "@context/UserContext";
import { useCourse } from "../../courses/hooks/useCourse";
import { createTutoringByStudent } from "../services/tutoringService";

import { AuthLayout } from "../../users/components/AuthLayout.jsx";
import { ErrorAlert } from "@components/ErrorAlert";
import { Input } from "@components/Input";
import { Textarea } from "@components/Textarea";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import { useFormSubmit } from "@utils/UseFormSubmit";
import {
  validateRequired,
  validateDate,
  validateStartHourTutoring,
} from "@utils/validation";
import { useValidation } from "@hooks/useValidation";

const validators = {
  request_due_date: (value) => validateDate(value, "Fecha límite"),
  request_due_time: (value) => validateRequired(value, "Hora límite"),
  time: (_value, form) => {
    if (form.request_due_date && form.request_due_time) {
      const WAIT_MINUTES = 180; // 3 horas
      const startErr = validateStartHourTutoring(form.request_due_date, form.request_due_time, WAIT_MINUTES, "hora límite");
      if (startErr) return startErr; // solo retorna si hay error
    }
    return null;
  },
};

const MAX_REQUEST_COMMENT = 500;
const MAX_LOCATION_COMMENT = 255;

export default function CreateTutoringByStudent() {
  const { user, userLoading, userError } = useUser();
  const { courseId } = useParams();
  const { course, loadingCourse, errorCourse } = useCourse(courseId);

  const { form, setField } = useFormState({
    request_due_date: "",
    request_due_time: "",
    request_comment: "",
    mode: "virtual",
    location: "",
  });

  const { errors, validate } = useValidation(validators);
  const { error, onSubmit } = useFormSubmit(createTutoringByStudent, "/");

  if (userLoading) return <p className="text-center mt-10">Cargando usuario...</p>;
  if (userError)   return <p className="text-center mt-10">Error al cargar perfil.</p>;
  if (!user)       return <p className="text-center mt-10">No hay usuario cargado.</p>;

  if (loadingCourse) return <p className="text-center mt-10">Cargando curso...</p>;
  if (errorCourse)   return <p className="text-center mt-10">Error al cargar el curso.</p>;
  if (!course)       return <p className="text-center mt-10">No hay curso cargado.</p>;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(form)) {
      const selectedSubjects = JSON.parse(localStorage.getItem("selectedSubjects")) || [];

      const dueLocal = new Date(`${form.request_due_date}T${form.request_due_time}:00`);
      const request_due_at = dueLocal.toISOString();

      const payload = {
        request_comment: form.request_comment.trim() || undefined,
        request_due_at,
        created_by_id: user.id,
        tutor_id: null,
        course_id: course.id,
        subject_ids: selectedSubjects,
        modality: form.mode,
        location: form.mode === "presencial" ? form.location.trim() : "",
      };

      onSubmit(payload);
      localStorage.removeItem("selectedSubjects");
    }
  };

  return (
    <AuthLayout title={`Solicitar tutoría para ${course.name}`}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="flex flex-col text-left">
          <label htmlFor="request_due_date" className="text-gray-600 text-xs font-medium mb-1">
            Fecha límite para recibir la tutoría
          </label>
          <Input
            id="request_due_date"
            type="date"
            value={form.request_due_date}
            onChange={(e) => setField("request_due_date", e.target.value)}
            className="p-1 border rounded-md text-sm"
            error={errors.request_due_date}
          />
        </div>

        <div className="flex flex-col text-left">
          <label htmlFor="request_due_time" className="text-gray-600 text-xs font-medium mb-1">
            Hora límite
          </label>
          <Input
            id="request_due_time"
            type="time"
            value={form.request_due_time}
            onChange={(e) => setField("request_due_time", e.target.value)}
            className="p-1 border rounded-md text-sm"
            error={errors.request_due_time || errors.time}
          />
        </div>

        <div className="flex flex-col text-left">
          <label htmlFor="request_comment" className="text-gray-600 text-xs font-medium mb-1">
            Comentario para el tutor (opcional)
          </label>
          <Textarea
            id="request_comment"
            rows={4}
            maxLength={MAX_REQUEST_COMMENT}
            value={form.request_comment}
            onChange={(e) => setField("request_comment", e.target.value)}
            className="p-2 border rounded-md text-sm"
            placeholder="Ej.: Preferiría viernes 18hs; temas 1 y 2…"
          />
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
            <Textarea
              id="location"
              rows={2}
              maxLength={MAX_LOCATION_COMMENT}
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              className="p-2 border rounded-md text-sm"
              placeholder="Ej.: Departamento, Ciudad, Calle."
            />
            <div className={`text-xs mt-1 ${form.location.length === MAX_LOCATION_COMMENT ? "text-red-600" : "text-gray-500"}`}>
              {form.location.length}/{MAX_LOCATION_COMMENT}
            </div>
          </div>
        )}

        {error.length > 0 && (
          <ErrorAlert>
            {error.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </ErrorAlert>
        )}

        <SubmitButton text="Enviar solicitud" />
      </form>
    </AuthLayout>
  );
}
