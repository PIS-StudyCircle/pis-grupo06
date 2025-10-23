import { useUser } from "@context/UserContext";
import { DEFAULT_PHOTO } from "@/shared/config";
import { useUserReviews } from "../hooks/useUserReviews";
import ReviewsList from "../components/ReviewsList";
import FeedbackList from "../components/FeedbackList";
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

  const [feedbacks, setFeedbacks] = useState([]);
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
      setFeedbacks(data);
    } catch (e) {
      setFeedbackError(e?.message || "Error al cargar feedbacks.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error)
    return <p className="text-center mt-10">Error al cargar perfil.</p>;
  if (!user)
    return <p className="text-center mt-10">No hay usuario cargado.</p>;

  const photoUrl = user.profile_photo_url || DEFAULT_PHOTO;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-6 space-y-8">
        {/* Panel superior del perfil */}
        <div className="bg-[#001F54] text-white rounded-3xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-6">
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
          {user.description && (
            <p className="mt-6 md:mt-0 text-sm bg-white/20 text-white/90 p-4 rounded-xl mx-auto text-center shadow-inner max-w-lg">
              {user.description}
            </p>
          )}
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
