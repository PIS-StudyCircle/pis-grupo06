import { useParams, useNavigate } from "react-router-dom"
import { useUser } from "@context/UserContext"
import { useCourse } from "../../courses/hooks/useCourse"
import { createTutoringByTutor } from "../services/tutoringService"

import { AuthLayout } from "../../users/components/AuthLayout.jsx"
import { Input } from "@components/Input"
import { ErrorAlert } from "@components/ErrorAlert"
import { SubmitButton } from "@components/SubmitButton"
import { useFormState } from "@utils/UseFormState"
import { useState } from "react"
import { validateDate, validateHoursTutoring, validateInteger } from "@utils/validation"
import { useValidation } from "@hooks/useValidation"
import {showSuccess} from '@shared/utils/toastService';

const validators = {
  limit: (value) => validateInteger(value, "Límite de estudiantes"),
}

export default function CreateTutoringByTutor() {
  const navigate = useNavigate()
  const { user, userLoading, userError } = useUser()

  const { courseId } = useParams()
  const { course, loadingCourse, errorCourse } = useCourse(courseId)

  const selectedSubjects = JSON.parse(localStorage.getItem("selectedSubjects")) || []

  const { form, setField } = useFormState({
    mode: "virtual",
    limit: "20",
    location: "",
  })

  const [availabilities, setAvailabilities] = useState([{ date: "", startTime: "", endTime: "" }])
  const [availabilityError, setAvailabilityError] = useState("")

  const { errors, validate } = useValidation(validators)
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

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
  }

  if (userLoading) return <p className="text-center mt-10">Cargando usuario...</p>
  if (userError) return <p className="text-center mt-10">Error al cargar perfil.</p>
  if (!user) return <p className="text-center mt-10">No hay usuario cargado.</p>

  if (loadingCourse) return <p className="text-center mt-10">Cargando curso...</p>
  if (errorCourse) return <p className="text-center mt-10">Error al cargar el curso.</p>
  if (!course) return <p className="text-center mt-10">No hay curso cargado.</p>

  const validateAvailabilities = () => {
    const errors = [];

    // helper para construir Date solo si hay datos
    const toDate = (date, time) =>
      date && time ? new Date(`${date}T${time}:00`) : null;

    // 1) Chequeos por slot (completitud, fecha válida, reglas de horas, pasado)
    availabilities.forEach((av, i) => {
      const label = `Disponibilidad ${i + 1}`;
      const missing = [];
      if (!av.date)      missing.push("fecha");
      if (!av.startTime) missing.push("hora de inicio");
      if (!av.endTime)   missing.push("hora final");
      if (missing.length) {
        errors.push(`${label}: completa ${missing.join(", ")}.`);
        // si faltan campos, no seguimos chequeando este slot
        return;
      }

      const dateErr = validateDate(av.date);
      if (dateErr) {
        errors.push(`${label}: ${dateErr}.`);
        // aún así seguimos con reglas de horas para mostrar todo
      }

      const hoursErr = validateHoursTutoring(av.date, av.startTime, av.endTime);
      if (hoursErr) {
        // mensajes esperados: "La hora de fin..." o "La sesión debe durar al menos 1 hora"
        errors.push(`${label}: ${hoursErr}.`);
      }
    });

    // 2) Solapamientos entre slots (solo si todos los necesarios tienen campos completos)
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
          errors.push(`Las disponibilidades ${i + 1} y ${j + 1} se solapan. Ajusta los horarios.`);
        }
      }
    }

    return errors.length ? errors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);

    // Validar campos básicos del formulario
    if (!validate(form)) {
      setLoading(false);
      return
    }

    // Validar disponibilidades
    const availabilityErrors = validateAvailabilities();
    if (availabilityErrors) {
      setAvailabilityError(availabilityErrors); // array
      setLoading(false);
      return;
    }
    setAvailabilityError(null);


    try {
      // Transformar availabilities al formato esperado por el backend
      // Transformar availabilities al formato esperado por el backend
      const availabilities_attributes = availabilities.map((availability) => {
        const startDateTime = new Date(`${availability.date}T${availability.startTime}:00`)
        const endDateTime = new Date(`${availability.date}T${availability.endTime}:00`)

        return {
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        }
      })

      const payload = {
        modality: form.mode,
        capacity: parseInt(form.limit, 10),
        created_by_id: user.id,
        tutor_id: user.id,
        course_id: course.id,
        subject_ids: selectedSubjects,
        location: form.mode === "presencial" ? form.location : "",
        availabilities_attributes,
      }

      const result = await createTutoringByTutor(payload)
    
      localStorage.removeItem("selectedSubjects")
      showSuccess("Tutoría creada con éxito.");
      
      // REDIRIGIR A LA SHOW PAGE de la tutoría
      if (result && result.tutoring.id) {
        navigate(`/tutorias/${result.tutoring.id}`)
      } else {
        navigate("/tutorias")
      }
    } catch (err) {
      console.error("Error creating tutoring sessions:", err)
      const message = err?.error || err?.message || "Error desconocido al crear la tutoría";
      setSubmitError(message);
    } finally {
      setLoading(false);
    } 
  }

  return (
    <AuthLayout title={`Tutoría para ${course.name}`}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
              maxLength={255}
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              className="p-2 border rounded-md text-sm"
              placeholder="Ej.: Departamento, Ciudad, Calle."
            />
            <div className={`text-xs mt-1 ${form.location.length === 255 ? "text-red-600" : "text-gray-500"}`}>
              {form.location.length}/{255}
            </div>
            {form.location.length > 255 && <span className="text-red-500 text-xs mt-1">Máximo 255 caracteres.</span>}
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
            maxLength={3}
          />
        </div>

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
                  El primer estudiante que se anote podrá elegir un horario <b>dentro del rango</b> que definas para esa fecha.
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

          {Array.isArray(availabilityError) && availabilityError.length > 0 && (
            <div className="text-red-500 text-xs space-y-1">
              {availabilityError.map((msg, i) => (
                <p key={i}>• {msg}</p>
              ))}
            </div>
          )}
        </div>

        {submitError && !availabilityError && (
          <ErrorAlert>{submitError}</ErrorAlert>
        )}

        <SubmitButton text={loading ? "Procesando..." : "Confirmar"}  disabled={loading} />
      </form>
    </AuthLayout>
  )
}