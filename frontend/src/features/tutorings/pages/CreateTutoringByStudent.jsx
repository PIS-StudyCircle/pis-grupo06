import { useParams, useNavigate } from "react-router-dom"
import { useUser } from "@context/UserContext"
import { useCourse } from "../../courses/hooks/useCourse"
import { createTutoringByStudent } from "../services/tutoringService"
import { showSuccess, showError } from "@shared/utils/toastService"
import { AuthLayout } from "../../users/components/AuthLayout.jsx"
import { ErrorAlert } from "@components/ErrorAlert"
import { SubmitButton } from "@components/SubmitButton"
import { useFormState } from "@utils/UseFormState"
import { useState } from "react"
import PageTitle from "@/shared/components/PageTitle";

const MAX_REQUEST_COMMENT = 500
const MAX_LOCATION_COMMENT = 255

export default function CreateTutoringByStudent() {
  const navigate = useNavigate()
  const { user, userLoading, userError } = useUser()
  const { courseId } = useParams()
  const { course, loadingCourse, errorCourse } = useCourse(courseId)

  const { form, setField } = useFormState({
    request_due_date: "",
    request_due_time: "",
    request_comment: "",
    mode: "virtual",
    location: "",
  })

  const [availabilities, setAvailabilities] = useState([{ date: "", startTime: "", endTime: "" }])
  const [submitError, setSubmitError] = useState([])

  if (userLoading) return <p className="text-center mt-10">Cargando usuario...</p>
  if (userError) return <p className="text-center mt-10">Error al cargar perfil.</p>
  if (!user) return <p className="text-center mt-10">No hay usuario cargado.</p>

  if (loadingCourse) return <p className="text-center mt-10">Cargando curso...</p>
  if (errorCourse) return <p className="text-center mt-10">Error al cargar el curso.</p>
  if (!course) return <p className="text-center mt-10">No hay curso cargado.</p>

  const addAvailability = () => {
    setAvailabilities([...availabilities, { date: "", startTime: "", endTime: "" }])
  }

  const removeAvailability = (index) => {
    if (availabilities.length > 1) {
      setAvailabilities(availabilities.filter((_, i) => i !== index))
    }
  }

  const updateAvailability = (index, field, value) => {
    const updated = [...availabilities]
    updated[index][field] = value
    setAvailabilities(updated)

    setField("_errors", { ...(form._errors ?? {}), availabilities: undefined });
  }

  const validate = () => {
    const errs = {};
    const availMsgs = [];

    if (form.request_comment.length > MAX_REQUEST_COMMENT)
      errs.request_comment = `Máximo ${MAX_REQUEST_COMMENT} caracteres.`;
    if (form.location.length > MAX_LOCATION_COMMENT)
      errs.location = `Máximo ${MAX_LOCATION_COMMENT} caracteres.`;

    const toDate = (d, t) => (d && t ? new Date(`${d}T${t}:00`) : null);
    const now = new Date();

    availabilities.forEach((av, i) => {
      const label = `Disponibilidad ${i + 1}`;

      const missing = [];
      if (!av.date) missing.push("fecha");
      if (!av.startTime) missing.push("hora de inicio");
      if (!av.endTime) missing.push("hora final");
      if (missing.length) {
        availMsgs.push(`${label}: completa ${missing.join(", ")}.`);
        return;
      }

      if (av.startTime >= av.endTime) {
        availMsgs.push(`${label}: la hora final debe ser posterior a la hora de inicio.`);
      } else {
        const [sh, sm] = av.startTime.split(":").map(Number);
        const [eh, em] = av.endTime.split(":").map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);
        if (duration < 60) {
          availMsgs.push(`${label}: el rango horario debe ser de al menos 1 hora.`);
        }
      }

      const start = toDate(av.date, av.startTime);
      if (start && start < now) {
        availMsgs.push(`${label}: la fecha/hora de inicio no puede ser en el pasado.`);
      }
    });

    for (let i = 0; i < availabilities.length; i++) {
      const a = availabilities[i];
      const aStart = toDate(a.date, a.startTime);
      const aEnd   = toDate(a.date, a.endTime);
      if (!aStart || !aEnd) continue;

      for (let j = i + 1; j < availabilities.length; j++) {
        const b = availabilities[j];
        const bStart = toDate(b.date, b.startTime);
        const bEnd   = toDate(b.date, b.endTime);
        if (!bStart || !bEnd) continue;

        const sameDay = a.date === b.date;
        const overlap = sameDay && aStart < bEnd && bStart < aEnd;
        if (overlap) {
          availMsgs.push(`Las disponibilidades ${i + 1} y ${j + 1} se solapan. Ajusta los horarios.`);
        }
      }
    }

    if (availMsgs.length > 0) {
      errs.availabilities = availMsgs;
    }

    return errs;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setField("_errors", errs);
      return;
    }

    const selectedSubjects = JSON.parse(localStorage.getItem("selectedSubjects")) || [];

    const payload = {
      request_comment: form.request_comment.trim() || undefined,
      created_by_id: user.id,
      tutor_id: null,
      course_id: course.id,
      subject_ids: selectedSubjects,
      modality: form.mode,
      location: form.mode === "presencial" ? form.location.trim() : "",
      availabilities_attributes: availabilities.map((av) => ({
        start_time: `${av.date}T${av.startTime}:00`,
        end_time: `${av.date}T${av.endTime}:00`,
      })),
    }

    try {
      const result = await createTutoringByStudent(payload)
      
      localStorage.removeItem("selectedSubjects")
      showSuccess("Solicitud de tutoría enviada con éxito.")
      
      if (result && result.tutoring && result.tutoring.id) {
        navigate(`/tutorias/${result.tutoring.id}`)
      } else {
        navigate("/tutorias")
      }
      
    } catch (err) {
      showError("Error al crear la solicitud: " + err.message)
      console.error("Error creating tutoring request:", err)
      setSubmitError([err.message || "Error desconocido"])
    }
  }

  const errs = form._errors || {}

  return (
    <AuthLayout>
      <PageTitle title={`Solicitar tutoría para ${course.name}`} className="subtitulo"></PageTitle>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="flex flex-col text-left">
          <label htmlFor="request_comment" className="text-gray-600 text-xs font-medium mb-1">
            Comentario para el tutor (opcional)
          </label>
          <textarea
            id="request_comment"
            rows={4}
            maxLength={MAX_REQUEST_COMMENT}
            value={form.request_comment}
            onChange={(e) => setField("request_comment", e.target.value)}
            className="p-2 border rounded-md text-sm"
            placeholder="¿Algo que deba saber el tutor?"
          />
          <div className="flex justify-between">
            <p id="request_comment_help" className="mt-1 text-[11px] text-gray-500">
              Ejemplos: preferencia de cupos, objetivos de la tutoría, etc.
            </p>
            <div
              className={`text-xs mt-1 ${form.request_comment.length === MAX_REQUEST_COMMENT ? "text-red-600" : "text-gray-500"}`}
            >
              {form.request_comment.length}/{MAX_REQUEST_COMMENT}
            </div>
          </div>
          {errs.request_comment && <span className="text-red-500 text-xs mt-1">{errs.request_comment}</span>}
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium">Modalidad:</span>
          <button
            type="button"
            className={`px-4 py-2 rounded font-medium transition-colors ${
              form.mode === "virtual" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setField("mode", "virtual")}
          >
            Virtual
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded font-medium transition-colors ${
              form.mode === "presencial" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
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
              maxLength={MAX_LOCATION_COMMENT}
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              className="p-2 border rounded-md text-sm"
              placeholder="Ej.: Departamento, Ciudad, Calle."
            />
            <div
              className={`text-xs mt-1 ${form.location.length === MAX_LOCATION_COMMENT ? "text-red-600" : "text-gray-500"}`}
            >
              {form.location.length}/{MAX_LOCATION_COMMENT}
            </div>
            {errs.location && <span className="text-red-500 text-xs mt-1">{errs.location}</span>}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-gray-600 text-sm font-semibold">
                Disponibilidad <span className="text-gray-500 font-normal">(fecha y rango horario)</span> <span className="text-red-500">*</span>
              </label>

              {/* Tooltip “?” */}
              <div className="relative group">
                <button
                  type="button"
                  aria-describedby="disp_help"
                  className="w-5 h-5 inline-flex items-center justify-center rounded-full border text-[11px] leading-none"
                >
                  ?
                </button>
                <div
                  id="disp_help"
                  role="tooltip"
                  className="absolute z-10 hidden group-hover:block mt-2 p-2 text-xs bg-gray-900 text-white rounded-md w-72"
                >
                  El tutor elegirá un horario <b>dentro del rango</b> que definas para esa fecha.
                  El rango debe ser de al menos 1 hora.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={addAvailability}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition-colors"
            >
              + Agregar
            </button>
          </div>

          {availabilities.map((availability, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Disponibilidad {index + 1}</span>
                {availabilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAvailability(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col text-left">
                  <label htmlFor={`date-${index}`} className="text-gray-600 text-xs font-medium mb-1">
                    Fecha
                  </label>
                  <input
                    id={`date-${index}`}
                    type="date"
                    value={availability.date}
                    onChange={(e) => updateAvailability(index, "date", e.target.value)}
                    className="p-1 border rounded-md text-sm"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label htmlFor={`start-${index}`} className="text-gray-600 text-xs font-medium mb-1">
                    Hora inicio
                  </label>
                  <input
                    id={`start-${index}`}
                    type="time"
                    value={availability.startTime}
                    onChange={(e) => updateAvailability(index, "startTime", e.target.value)}
                    className="p-1 border rounded-md text-sm"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label htmlFor={`end-${index}`} className="text-gray-600 text-xs font-medium mb-1">
                    Hora final
                  </label>
                  <input
                    id={`end-${index}`}
                    type="time"
                    value={availability.endTime}
                    onChange={(e) => updateAvailability(index, "endTime", e.target.value)}
                    className="p-1 border rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          {Array.isArray(errs.availabilities) && errs.availabilities.length > 0 && (
            <div className="text-red-500 text-xs space-y-1">
              {errs.availabilities.map((m, idx) => (
                <p key={idx}>• {m}</p>
              ))}
            </div>
          )}
        </div>

        {submitError.length > 0 && !errs.availabilities && (
          <ErrorAlert>
            {submitError.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </ErrorAlert>
        )}

        <SubmitButton text="Enviar solicitud" />
      </form>
    </AuthLayout>
  )
}
