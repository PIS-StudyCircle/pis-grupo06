import { useParams } from "react-router-dom"
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
import { useFormSubmit } from "@utils/UseFormSubmit"
import {showSuccess, showError} from '@shared/utils/toastService';

const validators = {
  limit: (value) => validateInteger(value, "Límite de estudiantes"),
}

export default function CreateTutoringByTutor() {
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
  const { error, onSubmit } = useFormSubmit(createTutoringByTutor, "/")

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
    // Validar campos completos y lógica básica
    const invalidAvailability = availabilities.some((av) => {
      if (!av.date || !av.startTime || !av.endTime) return true

      const dateError = validateDate(av.date, "Fecha de inicio")
      if (dateError) return true

      const hoursError = validateHoursTutoring(av.date, av.startTime, av.endTime)
      if (hoursError) return true

      return false
    })

    if (invalidAvailability) {
      return "Por favor completa todas las disponibilidades correctamente. La hora de fin debe ser posterior a la hora de inicio."
    }

    // Validar fechas en el pasado
    const now = new Date()
    const hasPastDate = availabilities.some((av) => {
      const avDate = new Date(`${av.date}T${av.startTime}:00`)
      return avDate < now
    })
    if (hasPastDate) {
      return "No puedes seleccionar fechas u horas en el pasado."
    }

    // Validar solapamientos
    for (let i = 0; i < availabilities.length; i++) {
      const av1Start = new Date(`${availabilities[i].date}T${availabilities[i].startTime}:00`)
      const av1End = new Date(`${availabilities[i].date}T${availabilities[i].endTime}:00`)

      for (let j = i + 1; j < availabilities.length; j++) {
        const av2Start = new Date(`${availabilities[j].date}T${availabilities[j].startTime}:00`)
        const av2End = new Date(`${availabilities[j].date}T${availabilities[j].endTime}:00`)

        // Verificar si hay solapamiento
        const overlap = av1Start < av2End && av2Start < av1End
        if (overlap) {
          return `Las disponibilidades ${i + 1} y ${j + 1} se solapan. Por favor ajusta los horarios.`
        }
      }
    }

    return null // Sin errores
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar campos básicos del formulario
    if (!validate(form)) {
      return
    }

    // Validar disponibilidades
    const availabilityErrors = validateAvailabilities()
    if (availabilityErrors) {
      setAvailabilityError(availabilityErrors)
      return
    }
    setAvailabilityError("") // Limpiar si está ok

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

      await onSubmit(payload)
      localStorage.removeItem("selectedSubjects")
      showSuccess("Tutoría creada con éxito.");
    } catch (err) {
      showError("Error al crear la tutoría: " + err.message);
      console.error("Error creating tutoring sessions:", err)
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
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-600 text-sm font-semibold">
              Disponibilidad <span className="text-red-500">*</span>
            </label>
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

          {availabilityError && <span className="text-red-500 text-xs">{availabilityError}</span>}
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
  )
}