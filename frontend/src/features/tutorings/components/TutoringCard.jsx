import { formatDateTime } from "@shared/utils/FormatDate";
import { useUser } from "@context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  showSuccess,
  showError,
  showConfirm,
} from "@shared/utils/toastService";
import { useState } from "react";

export default function TutoringCard({
  tutoring,
  mode: externalMode,
  onDesuscribirse,
  isBlockingPage,
  setIsBlockingPage
}) {
  const { user } = useUser();
  const [loadingUnirme, setLoadingUnirme] = useState(false);
  const [loadingDesuscribirme, setLoadingDesuscribirme] = useState(false);

  const handleUnirmeClick = async (tutoring) => {
    if (!tutoring) return;

    if (loadingUnirme) return;
    setLoadingUnirme(true);
    setIsBlockingPage(true);

    const primerEstudiante = tutoring.enrolled === 0;

    // Primer estudiante confirma las horas y se une a la tutoría
    if (primerEstudiante) {
      navigate(`/tutorias/${tutoring.id}/elegir_horario_estudiante`, {
        state: { tutoring },
      });
      setLoadingUnirme(false);
      return;
    }

    //Si no es el primer estudiante, simplemente se une
    try {
      const res = await fetch(
        `/api/v1/tutorings/${tutoring.id}/join_tutoring`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "student",
          }),
        }
      );
      if (res.ok) {
        showSuccess("Te uniste a la tutoría con éxito");
        navigate(`/notificaciones`)
      } else {
        const data = await res.json().catch(() => ({}));
        showError(data.error || "No se pudo unir a la tutoría");
      }
    } catch (error) {
      console.error(error);
      showError("Error en la conexion con el servidor");
    }finally{
      setIsBlockingPage(false);
      setLoadingUnirme(false);
    };
  };

  //let mode;

  const handleDesuscribirmeClick = async (tutoring) => {
    if (!tutoring) return;
    
    if (loadingDesuscribirme) return;

    setIsBlockingPage(true);
    showConfirm(      
      `¿Seguro que querés desuscribirte de la tutoría?`,
      async () => {
        try {
          setLoadingDesuscribirme(true);
          if (onDesuscribirse) await onDesuscribirse(tutoring.id);
          showSuccess("Te desuscribiste correctamente.");
          navigate(`/notificaciones`)
        } catch (error) {
          console.error(error);
          showError("Ocurrió un error al intentar desuscribirte.");
        } finally {
          setLoadingDesuscribirme(false);
          setIsBlockingPage(false);
        }
      },
      () => {
        setIsBlockingPage(false);
      }
    );
  };

  const noTieneTutor = tutoring.tutor_id === null;
  const cuposDisponibles =
    tutoring.capacity != null && tutoring.capacity > tutoring.enrolled;
  const soyTutor = tutoring.tutor_id === user?.id;
  const esCreador = tutoring.created_by_id === user?.id;
  const soyEstudiante = tutoring.user_enrolled;


  // Use externalMode if provided, otherwise calculate mode based on state
  let mode = externalMode;

  if (!externalMode) {
    if (soyTutor || soyEstudiante) {
      mode = "misTutorias";
    } else if (esCreador) {
      mode = "creador";
    } else if (noTieneTutor && cuposDisponibles) {
      mode = "ambos"; //TODO: Este modo se va a borrar mas adelante
    } else if (noTieneTutor) {
      mode = "serTutor";
    } else if (!cuposDisponibles && !noTieneTutor) {
      mode = "completo";
    } else if (cuposDisponibles) {
      mode = "serEstudiante";
    }
  }

  const navigate = useNavigate();

  return (
      <div
    className="w-full bg-white rounded-lg shadow p-4 my-4 cursor-pointer hover:shadow-md transition-shadow"
    role="button"
    tabIndex={0}
    onClick={() => {
      if (loadingUnirme) return;
      navigate(`/tutorias/${tutoring.id}`);
      }}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        navigate(`/tutorias/${tutoring.id}`);
      }
    }}
  >
    <div className="w-full bg-white rounded-lg shadow p-4 my-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 flex flex-col text-left">
          <p className="tutoring-card-title">
            <b>Materia: </b>
            {tutoring.course.name}
          </p>

          {tutoring.scheduled_at && (
            <p className="tutoring-card-title mt-1">
              <b>Fecha: </b> {formatDateTime(tutoring.scheduled_at)}
            </p>
          )}
          {tutoring.state === "active" && tutoring.duration_mins && (
            <p className="tutoring-card-title mt-1">
              <b>Duración: </b> {tutoring.duration_mins} minutos
            </p>
          )}
          <p className="tutoring-card-title mt-1">
            <b>Modalidad: </b> {tutoring.modality}
          </p>
          {tutoring.tutor_id !== null ? (
            <>
              <p className="tutoring-card-title mt-1">
                <b>Tutor: </b>{" "}
                {tutoring.tutor_name + " " + tutoring.tutor_last_name}{" "}
                <span className="text-gray-500">
                  {" (" + tutoring.tutor_email + ")"}
                </span>
              </p>
            </>
          ) : null}
          <p className="text-gray-600 text-sm mt-1">
            <b>Cupos disponibles: </b>
            {tutoring.capacity == null
              ? "A definir"
              : tutoring.capacity - (tutoring.enrolled ?? 0)}
          </p>
          <p className="tutoring-card-title mt-1">
            <b>Temas:</b>
          </p>

          <div className="flex flex-wrap gap-2 mt-1">
            {tutoring.subjects.map((subject) => (
              <span
                key={subject.id}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
              >
                {subject.name}
              </span>
            ))}
            {tutoring.subjects.length > 5 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                +{tutoring.subjects.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Botones */}
        {mode !== "creador" && (
          <div className="flex flex-col gap-3 md:pr-3">
            {mode === "serTutor" && (
              <button
                type="button"
                className={`btn w-full font-semibold transition ${
                  loadingUnirme
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                    : "bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // para que no se dispare el onClick del card
                  if (isBlockingPage) return;
                  navigate(`/tutorias/${tutoring.id}/elegir_horario_tutor`, {
                    state: { tutoring },
                  });
                }}
                disabled={isBlockingPage}
              >
                {loadingUnirme ? "Uniéndote a la tutoría como tutor..." : "Ser Tutor"}
              </button>
            )}

            {mode === "serEstudiante" && (
              <button
                type="button"
                className={`btn w-full font-semibold transition ${
                  loadingUnirme
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                    : "bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // para que no se dispare el onClick del card
                   if (isBlockingPage) return;
                  handleUnirmeClick(tutoring);
                }}
                disabled={isBlockingPage}
              >
                {loadingUnirme ? "Uniéndote a la tutoría..." : "Unirme"}
              </button>
            )}

            {mode === "ambos" && (
              <>
                <button
                  type="button"
                  className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation(); // para que no se dispare el onClick del card
                      if (isBlockingPage) return;
                      navigate(`/tutorias/${tutoring.id}/elegir_horario_tutor`, {
                      state: { tutoring },
                    });
                  }}
                >
                  Ser tutor
                </button>
                <button
                  type="button"
                  className={`btn w-full font-semibold transition ${
                    loadingUnirme
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                      : "bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // para que no se dispare el onClick del card
                     if (isBlockingPage) return;
                    handleUnirmeClick(tutoring);
                  }}
                  disabled={isBlockingPage}
                >
                  {loadingUnirme ? "Uniéndote a la tutoría..." : "Unirme"}
                </button>
              </>
            )}

            {mode === "misTutorias" && (
              <button
                type="button"
                className={`btn w-full font-semibold transition ${
                    loadingDesuscribirme
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                      : "bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white"
                  }`}
                onClick={(e) => {
                  e.stopPropagation(); // para que no se dispare el onClick del card
                   if (isBlockingPage) return;
                  handleDesuscribirmeClick(tutoring);
                }}
                disabled={isBlockingPage}
              >
                {loadingDesuscribirme ? "Desuscribiéndote a la tutoría..." : "Desuscribirme"}
              </button>
            )}

            {mode === "completo" && (
              <button
                type="button"
                className="btn w-full bg-gray-400 text-gray-700 cursor-not-allowed"
                disabled={true}
              >
                Completo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
     </div>
  );
}
