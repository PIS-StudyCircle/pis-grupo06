import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "@context/UserContext";
import { formatDateTime } from "@shared/utils/FormatDate";
import { showSuccess, showError, showConfirm } from "@shared/utils/toastService";
import { useTutoring } from "../hooks/useTutorings";
import {unsubscribeFromTutoring} from "../services/tutoringService";
import { DEFAULT_PHOTO } from "@/shared/config";
import { EstadoBadge, ShowTutoringSkeleton } from "@shared/utils/showTutorings"

/**
 * SHOW PAGE DE TUTORÍA (ampliada)
 */
export default function ShowPageTutoring() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const tutoringId = useMemo(() => Number(id), [id]);
  const { data: tutoring, loading, error, refetch } = useTutoring(null, tutoringId);
  const onDesuscribirse = (tid) => unsubscribeFromTutoring(tid);
  const [saving, setSaving] = useState(false);

    useEffect(() => {
    if (error || (!tutoring && !loading)) {
      navigate('/404', { replace: true });
    }
  }, [error, tutoring, loading, navigate]);


  const soyEstudiante = tutoring?.user_enrolled || false;
  const noTieneTutor = !(tutoring?.tutor?.id);
 const cuposDisponibles = useMemo(() => {
  if (!tutoring) return false;
  return tutoring.capacity != null && tutoring.capacity > (tutoring.enrolled ?? 0);
}, [tutoring]);
  const soyTutor = tutoring?.tutor_id === user?.id;
  const esCreador = tutoring?.created_by_id === user?.id;

  const handleSerTutor = () => {
    if (!tutoring) return;
    navigate(`/tutorias/${tutoring.id}/elegir_horario_tutor`, { state: { tutoring } });
  };

  const handleUnirme = async () => {
    if (!tutoring) return;
    const primerEstudiante = (tutoring.enrolled ?? 0) === 0;

    if (primerEstudiante) {
      navigate(`/tutorias/${tutoring.id}/elegir_horario_estudiante`, { state: { tutoring } });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/v1/tutorings/${tutoring.id}/join_tutoring`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "student" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo unir a la tutoría");
      }
      showSuccess("Te uniste a la tutoría con éxito");
      if (refetch) await refetch();
      else window.location.reload();
    } catch (e) {
      console.error(e);
      showError(e.message || "Error en la conexión con el servidor");
    } finally {
      setSaving(false);
    }
  };

  const handleDesuscribirme = async () => {
    if (!tutoring) return;

    showConfirm("¿Seguro que querés desuscribirte de la tutoría?", async () => {
      try {
        setSaving(true);
        await onDesuscribirse(tutoring.id);
        showSuccess("Te desuscribiste correctamente.");
        navigate(-1);
      } catch (e) {
        console.error(e);
        showError(e.message || "Ocurrió un error al intentar desuscribirte.");
      } finally {
        setSaving(false);
      }
    });
  };

  const mode = useMemo(() => {
    if (!tutoring) return "loading";
    if (soyTutor || soyEstudiante) return "misTutorias";
    if (esCreador) return "creador";
    if (noTieneTutor && cuposDisponibles) return "ambos";
    if (noTieneTutor) return "serTutor";
    if (!cuposDisponibles && !noTieneTutor) return "completo";
    if (cuposDisponibles) return "serEstudiante";
    return "default";
  }, [tutoring, soyTutor, soyEstudiante, esCreador, noTieneTutor, cuposDisponibles]);

  if (loading) return <ShowTutoringSkeleton />;

  return (
    <div className="max-w-5xl mx-auto p-4 min-h-screen">
      {/* Encabezado */}
      <div className="rounded-2xl bg-white shadow overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Tutoría de: {tutoring.course?.name || "Materia"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                <b>Modalidad:</b> {tutoring.modality}
                {tutoring.state === "active" && tutoring.duration_mins ? (
                  <>
                    {" · "} <b>Duración:</b> {tutoring.duration_mins} min
                  </>
                ) : null}
                {tutoring.scheduled_at ? (
                  <>
                    {" · "} <b>Fecha:</b> {formatDateTime(tutoring.scheduled_at)}
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <EstadoBadge state={tutoring.state} />
              <span className="text-sm text-gray-700 bg-white border rounded-full px-3 py-1">
                Cupos:{" "}
                {tutoring.capacity == null
                  ? "A definir"
                  : `${Math.max((tutoring.capacity ?? 0) - (tutoring.enrolled ?? 0), 0)} disp.`}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temas + Detalles alineados */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Temas */}
              <section>
                <h2 className="text-base font-semibold text-gray-900">Temas</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(tutoring.subjects || []).map((s) => (
                    <span
                      key={s.id}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </section>

              {/* Detalles */}
              <section className="space-y-3">
                <h2 className="text-base font-semibold text-gray-900">Detalles</h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Creada por</dt>
                    <dd className="text-gray-900">
                      {tutoring.created_by ? (
                         <Link
                          to={`/usuarios/${tutoring.created_by.id}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200">
                            <img
                              src={tutoring.created_by.profile_photo_url || DEFAULT_PHOTO}
                              alt={`${tutoring.created_by.name} ${tutoring.created_by.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>
                            {`${tutoring.created_by.name || ""} ${tutoring.created_by.last_name || ""}`.trim() ||
                              tutoring.created_by.email ||
                              "---"}
                          </span>
                        </Link>
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-gray-500">Tutor</dt>
                    <dd className="text-gray-900">
                      {tutoring.tutor ? (
                         <Link
                          to={`/usuarios/${tutoring.tutor.id}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                            <img
                              src={tutoring.tutor.profile_photo_url || DEFAULT_PHOTO}
                              alt={`${tutoring.tutor.name} ${tutoring.tutor.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>
                            {`${tutoring.tutor.name || ""} ${tutoring.tutor.last_name || ""}`.trim() ||
                              "---"}
                          </span>
                        </Link>
                      ) : (
                      <div className="text-center text-gray-500">
                        <span>Sin tutor asignado</span>
                      </div>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
    

          {/* Columna derecha: acciones */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Acciones</h3>
              <div className="mt-3 flex flex-col gap-2">
                {mode === "serTutor" && (
                  <button
                    type="button"
                    className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleSerTutor}
                    disabled={saving}
                  >
                    Ser tutor
                  </button>
                )}

                {mode === "serEstudiante" && (
                  <button
                    type="button"
                    className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleUnirme}
                    disabled={saving}
                  >
                    Unirme
                  </button>
                )}

                {mode === "ambos" && (
                  <>
                    <button
                      type="button"
                      className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={handleSerTutor}
                      disabled={saving}
                    >
                      Ser tutor
                    </button>
                    <button
                      type="button"
                      className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={handleUnirme}
                      disabled={saving}
                    >
                      Unirme
                    </button>
                  </>
                )}

                {mode === "misTutorias" && (
                  <button
                    type="button"
                    className="btn w-full bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleDesuscribirme}
                    disabled={saving}
                  >
                    Desuscribirme
                  </button>
                )}

                {mode === "completo" && (
                  <button
                    type="button"
                    className="btn w-full bg-gray-400 text-gray-700 cursor-not-allowed"
                    disabled
                  >
                    Completo
                  </button>
                )}

                <Link
                  to="/tutorias"
                  className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Volver al listado
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}