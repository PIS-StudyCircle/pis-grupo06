import { useParams } from "react-router-dom";
import { useUser } from "@context/UserContext";
import { useCourse } from "../../courses/hooks/useCourse";
import { createTutoringByStudent } from "../services/tutoringService";

import { AuthLayout } from "../../users/components/AuthLayout.jsx";
import { ErrorAlert } from "@components/ErrorAlert";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import { useFormSubmit } from "@utils/UseFormSubmit";

const MAX = 500;

export default function CreateTutoringByStudent() {
  const { user, userLoading, userError } = useUser();
  const { courseId } = useParams();
  const { course, loadingCourse, errorCourse } = useCourse(courseId);

  const selectedSubjects =
    JSON.parse(localStorage.getItem("selectedSubjects")) || [];

  const { form, setField } = useFormState({
    request_due_date: "",
    request_due_time: "",
    request_comment: "",
  });

  // Reutilizamos tu hook de submit
  const { error, onSubmit } = useFormSubmit(createTutoringByStudent, "/");

  if (userLoading) return <p className="text-center mt-10">Cargando usuario...</p>;
  if (userError)   return <p className="text-center mt-10">Error al cargar perfil.</p>;
  if (!user)       return <p className="text-center mt-10">No hay usuario cargado.</p>;

  if (loadingCourse) return <p className="text-center mt-10">Cargando curso...</p>;
  if (errorCourse)   return <p className="text-center mt-10">Error al cargar el curso.</p>;
  if (!course)       return <p className="text-center mt-10">No hay curso cargado.</p>;

  const validate = () => {
    const errs = {};
    if (!form.request_due_date) errs.request_due_date = "La fecha límite es obligatoria.";
    if (!form.request_due_time) errs.request_due_time = "La hora límite es obligatoria.";
    if (form.request_comment.length > MAX)
      errs.request_comment = `Máximo ${MAX} caracteres.`;
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      // Mostramos errores debajo de cada input sin romper tu flujo
      setField("_errors", errs);
      return;
    }

    // Construir request_due_at en ISO (UTC)
    const dueLocal = new Date(`${form.request_due_date}T${form.request_due_time}:00`);
    const request_due_at = dueLocal.toISOString();

    const payload = {
      // Campos de la solicitud
      state: "pending",
      request_comment: form.request_comment.trim() || undefined,
      request_due_at,

      // Relación/Contexto
      created_by_id: user.id,      // quien solicita
      tutor_id: null,              // aún sin tutor asignado
      course_id: course.id,
      subject_ids: selectedSubjects,

      // Defaults para pasar validaciones del modelo (no se muestran en UI)
      modality: "virtual",
      capacity: 20,
    };

    onSubmit(payload);
    localStorage.removeItem("selectedSubjects");
  };

  const errs = form._errors || {};

  return (
    <AuthLayout title={`Solicitar tutoría para ${course.name}`}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Fecha límite */}
        <div className="flex flex-col text-left">
          <label htmlFor="request_due_date" className="text-gray-600 text-xs font-medium mb-1">
            Fecha límite para recibir propuestas
          </label>
          <input
            id="request_due_date"
            type="date"
            value={form.request_due_date}
            onChange={(e) => setField("request_due_date", e.target.value)}
            className="p-1 border rounded-md text-sm"
          />
          {errs.request_due_date && (
            <span className="text-red-500 text-xs mt-1">{errs.request_due_date}</span>
          )}
        </div>

        {/* Hora límite */}
        <div className="flex flex-col text-left">
          <label htmlFor="request_due_time" className="text-gray-600 text-xs font-medium mb-1">
            Hora límite
          </label>
          <input
            id="request_due_time"
            type="time"
            value={form.request_due_time}
            onChange={(e) => setField("request_due_time", e.target.value)}
            className="p-1 border rounded-md text-sm"
          />
          {errs.request_due_time && (
            <span className="text-red-500 text-xs mt-1">{errs.request_due_time}</span>
          )}
        </div>

        {/* Comentario (≤ 500) */}
        <div className="flex flex-col text-left">
          <label htmlFor="request_comment" className="text-gray-600 text-xs font-medium mb-1">
            Comentario para el tutor (opcional)
          </label>
          <textarea
            id="request_comment"
            rows={4}
            maxLength={MAX}
            value={form.request_comment}
            onChange={(e) => setField("request_comment", e.target.value)}
            className="p-2 border rounded-md text-sm"
            placeholder="Ej.: Preferiría viernes 18hs; temas 1 y 2…"
          />
          <div className={`text-xs mt-1 ${form.request_comment.length === MAX ? "text-red-600" : "text-gray-500"}`}>
            {form.request_comment.length}/{MAX}
          </div>
          {errs.request_comment && (
            <span className="text-red-500 text-xs mt-1">{errs.request_comment}</span>
          )}
        </div>

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
