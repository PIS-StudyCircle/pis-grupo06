import { useUser } from "@context/UserContext";
import { DEFAULT_PHOTO } from "@/shared/config";
import { useUserReviews } from "../hooks/useUserReviews";
import ReviewsList from "../components/ReviewsList";
import { useState, useEffect } from "react";
import { getCourses } from "../../courses/services/courseService";
import { getFeedbacks } from "../services/feedbackServices";
import { Link, useNavigate } from "react-router-dom";
import { Star, Camera } from "lucide-react";

export default function Profile() {
  const { user, loading, error } = useUser();
  const navigate = useNavigate();
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

  const [hovered, setHovered] = useState(false); // 👈 para mostrar overlay en desktop

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
        const ratings = data.map((f) => Number(f?.rating)).filter((x) => !Number.isNaN(x));
        const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        setAverageRating(Number(avg.toFixed(2)));
        setTotalFeedbacks(ratings.length);
      } else {
        setFeedbacks(Array.isArray(data.feedbacks) ? data.feedbacks : []);
        const avg = Number(data?.average_rating ?? 0);
        setAverageRating(Number(avg.toFixed(2)));
        setTotalFeedbacks(Number(data?.total_feedbacks ?? (data?.feedbacks?.length || 0)));
      }
    } catch (e) {
      setFeedbackError(e?.message || "Error al cargar feedbacks.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-center mt-10">Error al cargar perfil.</p>;
  if (!user) return <p className="text-center mt-10">No hay usuario cargado.</p>;

  const photoUrl = user.profile_photo_url || DEFAULT_PHOTO;

  const StarRow = ({ value }) => {
    const fillFor = (i) => Math.max(0, Math.min(1, value - (i - 1)));
    return (
      <div className="flex items-center gap-1" aria-label={`Calificación promedio ${value.toFixed(1)} de 5`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = fillFor(i);
          return (
            <span key={i} className="relative inline-block w-5 h-5 align-middle">
              <span className="absolute inset-0 text-gray-300">
                <Star className="w-5 h-5" style={{ fill: "transparent" }} color="currentColor" />
              </span>
              <span
                className="absolute inset-0 text-yellow-500 overflow-hidden pointer-events-none"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="w-5 h-5" style={{ fill: "currentColor" }} color="currentColor" />
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
        {/* Panel superior del perfil */}
        <div className="bg-[#001F54] text-white rounded-3xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Col 1: Imagen + datos */}
            <div className="flex items-center gap-6">
              {/* Contenedor con overlay al hacer hover */}
              <div
                className="relative w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden cursor-pointer group"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <img
                  src={photoUrl}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay visible en hover (desktop) o fijo en mobile */}
                <div
                  className={`absolute inset-0 bg-black/50 flex items-center justify-center rounded-full transition-opacity duration-200 ${
                    hovered ? "opacity-100" : "opacity-0 md:opacity-0"
                  } md:group-hover:opacity-100 md:bg-black/50`}
                >
                  <button
                    onClick={() => navigate("/avatar/elegir_tipo", { state: { initialImage: photoUrl } })}
                    className="flex items-center gap-1 text-white text-xs font-medium bg-[#001F54]/80 px-2.5 py-1.5 rounded-full hover:bg-[#001F54]"
                  >
                    <Camera className="w-4 h-4" />
                    Editar
                  </button>
                </div>

                {/* Botón fijo para mobile (sin hover) */}
                <div className="absolute bottom-0 left-0 right-0 md:hidden bg-black/40 text-white text-center py-1 text-xs">
                  <button
                    onClick={() => navigate("/avatar/elegir_tipo", { state: { initialImage: photoUrl } })}
                    className="flex items-center justify-center gap-1 w-full"
                  >
                    
                    Editar 
                  </button>
                </div>
              </div>

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
                <p className="text-sm text-white/70 italic text-center">Sin descripción</p>
              )}
            </div>

            {/* Col 3: Rating */}
            <div className="flex md:justify-end justify-center">
              {feedbackLoading ? (
                <div className="text-sm bg-white/20 text-white/90 rounded-xl shadow-inner px-4 py-3">
                  Calculando rating…
                </div>
              ) : feedbackError ? null : totalFeedbacks === 0 ? null : (
                <div className="bg-white/20 text-white/90 rounded-xl shadow-inner px-4 py-3 flex items-center gap-3">
                  <StarRow value={averageRating} />
                  <div className="text-sm leading-tight">
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="opacity-80"> / 5</span>
                    <span className="opacity-80"> · {totalFeedbacks} voto{totalFeedbacks !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              )}
            </div>
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
              <p className="text-gray-500 text-sm">Aún no tenés materias favoritas.</p>
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
            {reviewsLoading && <p className="text-center text-gray-500">Cargando reseñas...</p>}
            {reviewsError && <p className="text-center text-red-500">Error al cargar reseñas.</p>}
            {!reviewsLoading && !reviewsError && <ReviewsList reviews={reviews} />}
          </div>
        </div>
      </div>
    </div>
  );
}

