import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUserById,
  canReviewUser,
  createReview,
  getReviewsByUser,
} from "../services/usersServices";
import { useUserReviews } from "../hooks/useUserReviews";
import { useBadges } from "../hooks/useInsignas";
import ReviewsList from "../components/ReviewsList";
import { DEFAULT_PHOTO } from "@/shared/config";
import { getFeedbacks } from "../services/feedbackServices";
import { Star } from "lucide-react";
import { showError } from "@shared/utils/toastService";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [averageRating, setAverageRating] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const { reviews, loading: reviewsLoading, setReviews } = useUserReviews(id);

  useEffect(() => {
    async function loadUser() {
      setLoadingUser(true);
      try {
        const userData = await getUserById(id);
        const canReviewData = await canReviewUser(id);
        setUser(userData);
        setCanReview(canReviewData);

        // cargar rating promedio
        setFeedbackLoading(true);
        const feedbackData = await getFeedbacks(id);
        setAverageRating(Number(feedbackData?.average_rating ?? 0));
        setTotalFeedbacks(Number(feedbackData?.total_feedbacks ?? 0));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUser(false);
        setFeedbackLoading(false);
      }
    }
    loadUser();
  }, [id]);

  // Crear nueva reseña
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createReview(id, review);
      setReview("");
      setShowForm(false);
      setCanReview(false);

      const updated = await getReviewsByUser(id);
      setReviews(updated);
    } catch (err) {
      showError("Error al enviar la reseña: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser || reviewsLoading)
    return <p className="text-center mt-10">Cargando...</p>;

  if (error) return <p className="text-center mt-10">Error: {error}</p>;

  if (!user) return <p className="text-center mt-10">Usuario no encontrado.</p>;

  const photoUrl = user.profile_photo_url || DEFAULT_PHOTO;

  const counts = user?.counts ?? {};
  const insignas = useBadges(counts);

  const BADGE_TUTORIAS_DADAS = insignas.tutorias_dadas;
  const BADGE_TUTORIAS_RECIBIDAS = insignas.tutorias_recibidas;
  const BADGE_RESENAS_DADAS = insignas.resenas_dadas;
  const BADGE_FEEDBACK_DADO = insignas.feedback_dado;

  const tutorias_dadas = counts.tutorias_dadas || 0;
  const tutorias_recibidas = counts.tutorias_recibidas || 0;
  const resenas_dadas = counts.resenas_dadas || 0;
  const feedback_dado = counts.feedback_dado || 0;

  const StarRow = ({ value }) => {
    const fillFor = (i) => Math.max(0, Math.min(1, value - (i - 1)));
    return (
      <div className="flex items-center gap-1">
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-[#001F54] text-white rounded-3xl shadow-xl w-full max-w-md p-6">
        {/* --- Datos del usuario --- */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={photoUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
          <p className="mt-3 text-lg font-semibold text-center">
            {user.name} {user.last_name}
          </p>

          {/* Insignias compactas (solo íconos, sin fondo, por encima de Email) */}
          {(tutorias_dadas > 0 ||
            tutorias_recibidas > 0 ||
            resenas_dadas > 0 ||
            feedback_dado > 0) && (
            <div className="mt-3 flex flex-wrap justify-center gap-4">
              {tutorias_dadas > 0 && BADGE_TUTORIAS_DADAS && (
                <div className="w-14 h-14 rounded-full ring-2 ring-white/60 shadow-md overflow-hidden bg-white/90">
                  <img
                    src={BADGE_TUTORIAS_DADAS}
                    alt="Tutorías dadas"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {tutorias_recibidas > 0 && BADGE_TUTORIAS_RECIBIDAS && (
                <div className="w-14 h-14 rounded-full ring-2 ring-white/60 shadow-md overflow-hidden bg-white/90">
                  <img
                    src={BADGE_TUTORIAS_RECIBIDAS}
                    alt="Tutorías recibidas"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {resenas_dadas > 0 && BADGE_RESENAS_DADAS && (
                <div className="w-14 h-14 rounded-full ring-2 ring-white/60 shadow-md overflow-hidden bg-white/90">
                  <img
                    src={BADGE_RESENAS_DADAS}
                    alt="Reseñas dadas"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {feedback_dado > 0 && BADGE_FEEDBACK_DADO && (
                <div className="w-14 h-14 rounded-full ring-2 ring-white/60 shadow-md overflow-hidden bg-white/90">
                  <img
                    src={BADGE_FEEDBACK_DADO}
                    alt="Feedback dado"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Rating promedio */}
          {!feedbackLoading && totalFeedbacks > 0 && (
            <div className="flex flex-col items-center mt-2 bg-white/20 px-4 py-2 rounded-lg shadow-inner">
              <StarRow value={averageRating} />
              <p className="text-sm mt-1">
                <span className="font-semibold">
                  {averageRating.toFixed(1)}
                </span>
                <span className="opacity-80"> / 5</span>
                <span className="opacity-80">
                  {" "}
                  · {totalFeedbacks} voto{totalFeedbacks !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <p className="text-sm text-gray-300">Email</p>
            <p className="w-full rounded-lg px-3 py-2 text-black bg-white opacity-80">
              {user.email}
            </p>
          </div>

          {user.description && (
            <div>
              <p className="text-sm text-gray-300">Descripción</p>
              <p className="w-full rounded-lg px-3 py-2 text-black bg-white opacity-80">
                {user.description}
              </p>
            </div>
          )}
        </div>

        {/* --- Sección de Reseñas --- */}
        <div className="bg-white text-black rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-2 text-center text-[#001F54]">
            Reseñas
          </h3>

          <ReviewsList
            reviews={reviews}
            onUpdate={async () => {
              const updatedReviews = await getReviewsByUser(id);
              const canReviewNow = await canReviewUser(id);
              setReviews(updatedReviews);
              setCanReview(canReviewNow);
            }}
          />

          {/* Botón para dejar reseña */}
          {canReview && !showForm && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Dejar reseña
              </button>
            </div>
          )}

          {/* Formulario de reseña */}
          {showForm && (
            <form onSubmit={handleSubmitReview} className="mt-4 space-y-3">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full border rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Escribí tu reseña..."
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-60"
                >
                  {submitting ? "Enviando..." : "Confirmar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 px-4 py-1.5 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
