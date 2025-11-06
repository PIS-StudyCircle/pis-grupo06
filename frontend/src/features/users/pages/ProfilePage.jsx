import { useUser } from "@context/UserContext";
import { DEFAULT_PHOTO } from "@/shared/config";
import { useBadges } from "../hooks/useInsignas";
import { useUserReviews } from "../hooks/useUserReviews";
import ReviewsList from "../components/ReviewsList";
import { useState, useEffect } from "react";
import { getCourses } from "../../courses/services/courseService";
import { getFeedbacks } from "../services/feedbackServices";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function Profile() {
  const { user, loading, error } = useUser();
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
  } = useUserReviews(user?.id);

  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState("");

  const [averageRating, setAverageRating] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  const [, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchFavorites();
    fetchFeedbacks();
  }, [user]);

  async function fetchFavorites() {
    try {
      setFavLoading(true);
      const data = await getCourses(1, 50, "", true);
      setFavorites(data.courses);
    } catch (e) {
      setFavError(e?.message || "Error al cargar favoritas.");
    } finally {
      setFavLoading(false);
    }
  }

  async function fetchFeedbacks() {
    try {
      setFeedbackError("");
      setFeedbackLoading(true);
      const data = await getFeedbacks();

      if (Array.isArray(data)) {
        setFeedbacks(data);
        const ratings = data
          .map((f) => Number(f?.rating))
          .filter((x) => !Number.isNaN(x));
        const avg = ratings.length
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
        setAverageRating(Number(avg.toFixed(2)));
        setTotalFeedbacks(ratings.length);
      } else {
        setFeedbacks(Array.isArray(data.feedbacks) ? data.feedbacks : []);
        const avg = Number(data?.average_rating ?? 0);
        setAverageRating(Number(avg.toFixed(2)));
        setTotalFeedbacks(
          Number(data?.total_feedbacks ?? (data?.feedbacks?.length || 0))
        );
      }
    } catch (e) {
      setFeedbackError(e?.message || "Error al cargar feedbacks.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  const counts = user?.counts ?? {};
  const insignas = useBadges(counts);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error)
    return <p className="text-center mt-10">Error al cargar perfil.</p>;
  if (!user)
    return <p className="text-center mt-10">No hay usuario cargado.</p>;

  const photoUrl = user.profile_photo_url || DEFAULT_PHOTO;

  const BADGE_TUTORIAS_DADAS = insignas.tutorias_dadas;
  const BADGE_TUTORIAS_RECIBIDAS = insignas.tutorias_recibidas;
  const BADGE_RESENAS_DADAS = insignas.resenas_dadas;
  const BADGE_FEEDBACK_DADO = insignas.feedback_dado;

  const tutorias_dadas = counts.tutorias_dadas || 0;
  const tutorias_recibidas = counts.tutorias_recibidas || 0;
  const resenas_dadas = counts.resenas_dadas || 0;
  const feedback_dado = counts.feedback_dado || 0;

  // Estrellas con medias (visual del promedio)
  const StarRow = ({ value }) => {
    const fillFor = (i) => Math.max(0, Math.min(1, value - (i - 1))); // 0..1
    return (
      <div
        className="flex items-center gap-1"
        aria-label={`Calificación promedio ${value.toFixed(1)} de 5`}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = fillFor(i);
          return (
            <span
              key={i}
              className="relative inline-block w-5 h-5 align-middle"
            >
              <span className="absolute inset-0 text-gray-300">
                <Star
                  className="w-5 h-5"
                  style={{ fill: "transparent" }}
                  color="currentColor"
                />
              </span>
              <span
                className="absolute inset-0 text-yellow-500 overflow-hidden pointer-events-none"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className="w-5 h-5"
                  style={{ fill: "currentColor" }}
                  color="currentColor"
                />
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-6 space-y-8">
        {/* Panel superior del perfil - 3 columnas */}
        <div className="bg-[#001F54] text-white rounded-3xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Col 1: Perfil + datos */}
            <div className="flex items-center gap-6">
              <img
                src={photoUrl}
                alt="avatar"
                className="w-24 h-24 rounded-full border-4 border-white shadow-md"
              />
              <div>
                <h1 className="text-2xl font-semibold">
                  {user.name} {user.last_name}
                </h1>
                <p className="text-sm text-gray-200 mt-1">{user.email}</p>
              </div>
            </div>

            {/* Col 2: Descripción */}
            <div className="flex justify-center">
              {user.description ? (
                <p className="text-sm bg-white/20 text-white/90 p-4 rounded-xl shadow-inner max-w-lg text-center">
                  {user.description}
                </p>
              ) : (
                <p className="text-sm text-white/70 italic text-center">
                  Sin descripción
                </p>
              )}
            </div>

            {/* Col 3: Rating promedio (solo si hay ratings) */}
            <div className="flex md:justify-end justify-center">
              {feedbackLoading ? (
                <div className="text-sm bg-white/20 text-white/90 rounded-xl shadow-inner px-4 py-3">
                  Calculando rating…
                </div>
              ) : feedbackError ? null : totalFeedbacks === 0 ? null : (
                <div className="bg-white/20 text-white/90 rounded-xl shadow-inner px-4 py-3 flex items-center gap-3">
                  <StarRow value={averageRating} />
                  <div className="text-sm leading-tight">
                    <span className="font-semibold">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="opacity-80"> / 5</span>
                    <span className="opacity-80">
                      {" "}
                      · {totalFeedbacks} voto{totalFeedbacks !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Segunda fila: Insignias */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-center mb-4">
              Insignias
            </h2>

            <div className="flex flex-wrap justify-center gap-10">
              {/* Tutorías dadas */}
              {tutorias_dadas > 0 && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24">
                    <div className="w-24 h-24 rounded-full ring-2 ring-white/50 shadow-lg overflow-hidden">
                      <img
                        src={BADGE_TUTORIAS_DADAS}
                        alt="Tutorías dadas"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span
                      className="absolute bottom-0 right-0 translate-y-1/2 text-[12px] px-2 py-0.5 rounded-full 
                bg-white text-[#001F54] font-semibold shadow border border-white/60"
                    >
                      {tutorias_dadas}
                    </span>
                  </div>
                  <span className="text-sm text-white/90 text-center">
                    Tutorías dadas
                  </span>
                </div>
              )}

              {/* Tutorías recibidas */}
              {tutorias_recibidas > 0 && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24">
                    <div className="w-24 h-24 rounded-full ring-2 ring-white/50 shadow-lg overflow-hidden">
                      <img
                        src={BADGE_TUTORIAS_RECIBIDAS}
                        alt="Tutorías recibidas"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span
                      className="absolute bottom-0 right-0 translate-y-1/2 text-[12px] px-2 py-0.5 rounded-full 
                bg-white text-[#001F54] font-semibold shadow border border-white/60"
                    >
                      {tutorias_recibidas}
                    </span>
                  </div>
                  <span className="text-sm text-white/90 text-center">
                    Tutorías recibidas
                  </span>
                </div>
              )}

              {/* Reseñas dadas */}
              {resenas_dadas > 0 && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24">
                    <div className="w-24 h-24 rounded-full ring-2 ring-white/50 shadow-lg overflow-hidden">
                      <img
                        src={BADGE_RESENAS_DADAS}
                        alt="Reseñas dadas"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span
                      className="absolute bottom-0 right-0 translate-y-1/2 text-[12px] px-2 py-0.5 rounded-full 
                bg-white text-[#001F54] font-semibold shadow border border-white/60"
                    >
                      {resenas_dadas}
                    </span>
                  </div>
                  <span className="text-sm text-white/90 text-center">
                    Reseñas dadas
                  </span>
                </div>
              )}

              {/* Feedback dado */}
              {feedback_dado > 0 && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24">
                    <div className="w-24 h-24 rounded-full ring-2 ring-white/50 shadow-lg overflow-hidden">
                      <img
                        src={BADGE_FEEDBACK_DADO}
                        alt="Feedback dado"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span
                      className="absolute bottom-0 right-0 translate-y-1/2 text-[12px] px-2 py-0.5 rounded-full 
                bg-white text-[#001F54] font-semibold shadow border border-white/60"
                    >
                      {feedback_dado}
                    </span>
                  </div>
                  <span className="text-sm text-white/90 text-center">
                    Feedback dado
                  </span>
                </div>
              )}
            </div>

            {/* Si no tiene ninguna insignia */}
            {tutorias_dadas === 0 &&
              tutorias_recibidas === 0 &&
              resenas_dadas === 0 &&
              feedback_dado === 0 && (
                <p className="text-center text-white/70 italic mt-6">
                  ¡Aún no tienes insignias! Participa en tutorías y obtén tus
                  primeras.
                </p>
              )}
          </div>
        </div>

        {/* Tarjetas inferiores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Favoritas */}
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3 text-[#001F54]">
              <Star className="w-5 h-5 text-yellow-500" />
              Materias favoritas
            </h2>
            {favLoading && <p className="text-gray-500">Cargando…</p>}
            {favError && <p className="text-red-600 text-sm">{favError}</p>}
            {!favLoading && !favError && favorites.length === 0 && (
              <p className="text-gray-500 text-sm">
                Aún no tenés materias favoritas.
              </p>
            )}
            {!favLoading && favorites.length > 0 && (
              <ul className="divide-y divide-gray-100 overflow-y-auto max-h-72">
                {favorites.map((c) => (
                  <li key={c.id} className="py-2">
                    <Link
                      to={`/materias/${c.id}`}
                      className="font-medium text-[#001F54] hover:underline"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reseñas */}
          <div className="bg-white text-black rounded-3xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3 text-center text-[#001F54]">
              Mis reseñas
            </h3>
            {reviewsLoading && (
              <p className="text-center text-gray-500">Cargando reseñas...</p>
            )}
            {reviewsError && (
              <p className="text-center text-red-500">
                Error al cargar reseñas.
              </p>
            )}
            {!reviewsLoading && !reviewsError && (
              <ReviewsList reviews={reviews} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
