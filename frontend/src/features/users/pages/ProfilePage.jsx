import { useUser } from "@context/UserContext";
import { DEFAULT_PHOTO } from "@/shared/config";
import { useUserReviews } from "../hooks/useUserReviews";
import ReviewsList from "../components/ReviewsList";
import { useState, useEffect, useCallback } from "react";
import { getCourses } from "../../courses/services/courseService";
import { getFeedbacks } from "../services/feedbackServices";
import { Link, useNavigate } from "react-router-dom";
import { Star, Camera } from "lucide-react";

export default function Profile() {

  const navigate = useNavigate();
  // Get user context
  const { user, refetchCurrentUser, booting } = useUser();
  // Reviews hook - only call after user is available

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
  } = useUserReviews(user?.id);

  // State for favorites
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState("");

  // State for rating promedio y total
  const [averageRating, setAverageRating] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  // State for feedbacks
  const [, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");


  // Fetch favorites - wrapped in useCallback to be used in useEffect dependencies
  const fetchFavorites = useCallback(async () => {
    try {
      setFavLoading(true);
      const data = await getCourses(1, 50, "", true);
      setFavorites(data.courses);
    } catch (e) {
      setFavError(e?.message || "Error al cargar favoritas.");
    } finally {
      setFavLoading(false);
    }
  }, []);

  // Fetch feedbacks - wrapped in useCallback to be used in useEffect dependencies
  const fetchFeedbacks = useCallback(async () => {
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
  }, []);

  // Load profile data on mount and when user changes
  useEffect(() => {
    async function loadProfile() {
      // Fetch user data - use fresh fetch for current user to avoid cached masked email
      await refetchCurrentUser();
      if (user) {
        fetchFavorites();
        fetchFeedbacks();
      }
    }
    loadProfile();
  }, [refetchCurrentUser, user, fetchFavorites, fetchFeedbacks]);



  // StarRow component for displaying rating stars
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

  // Loading and error states
  if (booting) return <p className="text-center mt-10">Cargando...</p>;
  if (!user) return <p className="text-center mt-10">No hay usuario cargado.</p>;

  const photoUrl = user.profile_photo_url || DEFAULT_PHOTO;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-6 space-y-8">
        {/* Panel superior del perfil */}
        <div className="bg-[#001F54] text-white rounded-3xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Col 1: Imagen + datos */}
            <div className="flex items-center gap-6">
              {/* Contenedor con overlay al hacer hover */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden cursor-pointer group"
                >
                  <img
                    src={photoUrl}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                <button
                  onClick={() => navigate("/avatar/elegir_tipo")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-full transition-colors duration-200 border border-white/30"
                >
                  <Camera className="w-4 h-4" />
                  Editar con IA
                </button>
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
             <div className="min-h-[56px] flex items-center justify-center">
                {feedbackLoading ? (
                  <p className="text-sm text-white/90">Calculando rating…</p>
                ) : feedbackError ? null : totalFeedbacks === 0 ? (
                  <p className="text-sm text-white/70 italic">Sin ratings</p>
                ) : (
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