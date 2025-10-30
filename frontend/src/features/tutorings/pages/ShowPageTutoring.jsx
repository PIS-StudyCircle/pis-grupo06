import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "@context/UserContext";
import { formatDateTime } from "@shared/utils/FormatDate";
import { showSuccess, showError, showConfirm } from "@shared/utils/toastService";
import { useTutoring, useTutorings } from "../hooks/useTutorings"; // 🎯 AGREGAR ESTA LÍNEA
import { DEFAULT_PHOTO } from "@/shared/config";

/**
 * SHOW PAGE DE TUTORÍA (ampliada)
 * - URL sugerida: /tutorias/:id
 * - Basada en la TutoringCard pero con layout de "detalle" a pantalla completa
 * - Muestra información ampliada + acciones contextuales (unirse, ser tutor, desuscribirse)
 */
export default function ShowPageTutoring() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  // 🎯 REEMPLAZAR ESTADOS MANUALES CON EL HOOK
  const tutoringId = useMemo(() => Number(id), [id]);
  const { data: tutoring, loading, error, refetch } = useTutoring(null, tutoringId);

  // 🎯 AGREGAR ESTA LÍNEA QUE FALTA
  const { onDesuscribirse } = useTutorings();

  // 🎯 MANTENER SOLO ESTOS ESTADOS
  const [saving, setSaving] = useState(false);
  const [soyEstudiante, setSoyEstudiante] = useState(false);

  // --------------------------------------
  // Fetch: ¿existo como estudiante en esta tutoría? (MANTENER)
  // --------------------------------------
  useEffect(() => {
    let cancel = false;

    async function checkSoyEstudiante() {
      if (!user?.id || !tutoringId) {
        setSoyEstudiante(false);
        return;
      }
      try {
        const res = await fetch(`/api/v1/tutorings/${tutoringId}/exists_user_tutoring`, {
          credentials: "include",
        });
        if (!res.ok) {
          console.warn("exists_user_tutoring no OK:", res.status);
          setSoyEstudiante(false);
          return;
        }
        const { exists } = await res.json().catch(() => ({ exists: false }));
        if (!cancel) setSoyEstudiante(!!exists);
      } catch (e) {
        if (!cancel) {
          console.warn("fetch error:", e);
          setSoyEstudiante(false);
        }
      }
    }

    checkSoyEstudiante();
    return () => {
      cancel = true;
    };
  }, [user?.id, tutoringId]);

  // --------------------------------------
  // Derivados de estado (MANTENER)
  // --------------------------------------
  const noTieneTutor = tutoring?.tutor_id == null;
  const cuposDisponibles = useMemo(() => {
    if (!tutoring) return false;
    if (tutoring.capacity == null) return true;
    return (tutoring.capacity ?? 0) > (tutoring.enrolled ?? 0);
  }, [tutoring]);

  const soyTutor = tutoring?.tutor_id === user?.id;
  const esCreador = tutoring?.created_by_id === user?.id;

  // --------------------------------------
  // Acciones (ACTUALIZAR)
  // --------------------------------------
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
      
      // 🎯 USAR REFETCH DEL HOOK EN LUGAR DE FUNCIÓN MANUAL
      if (refetch) {
        await refetch();
      } else {
        window.location.reload(); // fallback si no hay refetch
      }
    } catch (e) {
      console.error(e);
      showError(e.message || "Error en la conexión con el servidor");
    } finally {
      setSaving(false);
    }
  };

  // 🎯 SIMPLIFICAR LA FUNCIÓN
  const handleDesuscribirme = async () => {
    if (!tutoring) return;
    
    showConfirm("¿Seguro que querés desuscribirte de la tutoría?", async () => {
      try {
        setSaving(true);
        
        // 🎯 USAR EL MÉTODO DEL HOOK EN LUGAR DE FETCH MANUAL
        await onDesuscribirse(tutoring.id);
        
        showSuccess("Te desuscribiste correctamente.");
        navigate(-1); // Volver atrás
        
      } catch (e) {
        console.error(e);
        showError(e.message || "Ocurrió un error al intentar desuscribirte.");
      } finally {
        setSaving(false);
      }
    });
  };

  // --------------------------------------
  // Modo (MANTENER)
  // --------------------------------------
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

  // 🎯 ACTUALIZAR MANEJO DE ESTADOS
  if (loading) return <ShowTutoringSkeleton />;
  
  if (error) return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="rounded-lg border bg-white p-6 shadow">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error al cargar la tutoría</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => refetch?.()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reintentar
            </button>
            <Link 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" 
              to="/tutorias"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (!tutoring) return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="rounded-lg border bg-white p-6 shadow">
        <div className="text-center">
          <p className="text-gray-700 mb-4">No se encontró la tutoría.</p>
          <Link className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" to="/tutorias">
            Volver al listado
          </Link>
        </div>
      </div>
    </div>
  );

  // 🎯 MANTENER TODO EL JSX IGUAL
  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Encabezado */}
      <div className="rounded-2xl bg-white shadow overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {tutoring.course?.name || "Materia"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                <b>Modalidad:</b> {tutoring.modality}
                {tutoring.state === "active" && tutoring.duration_mins ? (
                  <>
                    {" · "}<b>Duración:</b> {tutoring.duration_mins} min
                  </>
                ) : null}
                {tutoring.scheduled_at ? (
                  <>
                    {" · "}<b>Fecha:</b> {formatDateTime(tutoring.scheduled_at)}
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <EstadoBadge state={tutoring.state} />
              <span className="text-sm text-gray-700 bg-white border rounded-full px-3 py-1">
                Cupos: {tutoring.capacity == null ? "A definir" : `${Math.max((tutoring.capacity ?? 0) - (tutoring.enrolled ?? 0), 0)} disp.`}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: info principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temas */}
            <section>
              <h2 className="text-base font-semibold text-gray-900">Temas</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {(tutoring.subjects || []).slice(0, 12).map((s) => (
                  <span key={s.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {s.name}
                  </span>
                ))}
                {tutoring.subjects?.length > 12 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    +{tutoring.subjects.length - 12}
                  </span>
                )}
              </div>
            </section>

            {/* Descripción */}
            {tutoring.description && (
              <section>
                <h2 className="text-base font-semibold text-gray-900">Descripción</h2>
                <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-line">
                  {tutoring.description}
                </p>
              </section>
            )}

            {/* Detalles adicionales */}
            <section>
              <h2 className="text-base font-semibold text-gray-900">Detalles</h2>
              <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
               <div>
                <dt className="text-gray-500">Creada por</dt>
                <dd className="text-gray-900">
                  {tutoring.created_by ? (
                    <Link 
                      to={`/usuarios/${tutoring.created_by.id}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline w-fit"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        <img 
                          src={tutoring.created_by.profile_photo_url || DEFAULT_PHOTO} 
                          alt={`${tutoring.created_by.name} ${tutoring.created_by.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>
                        {`${tutoring.created_by.name || ''} ${tutoring.created_by.last_name || ''}`.trim() || 
                         tutoring.created_by.email || 
                         "Ver perfil"
                        }
                      </span>
                    </Link>
                  ) : "-"}
                </dd>
              </div>
                {tutoring.tutor_id != null && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Tutor</dt>
                    <dd className="text-gray-900">
                      <Link 
                        to={`/usuarios/${tutoring.tutor.id}`}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline w-fit"
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          <img 
                            src={tutoring.tutor.profile_photo_url || DEFAULT_PHOTO} 
                            alt={`${tutoring.tutor.name} ${tutoring.tutor.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>
                          {`${tutoring.tutor.name || ''} ${tutoring.tutor.last_name || ''}`.trim() || "Ver perfil"}
                        </span>
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
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

function EstadoBadge({ state }) {
  if (!state) return null;
  const mapping = {
    active: { text: "Activa", cls: "bg-green-100 text-green-800" },
    scheduled: { text: "Agendada", cls: "bg-blue-100 text-blue-800" },
    finished: { text: "Finalizada", cls: "bg-gray-200 text-gray-700" },
    cancelled: { text: "Cancelada", cls: "bg-red-100 text-red-700" },
  };
  const info = mapping[state] || { text: state, cls: "bg-gray-100 text-gray-800" };
  return (
    <span className={`text-sm px-3 py-1 rounded-full ${info.cls}`}>{info.text}</span>
  );
}

function ShowTutoringSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-4 animate-pulse">
      <div className="rounded-2xl bg-white shadow overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-100" />
        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-100 rounded" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-gray-50 p-4 h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
