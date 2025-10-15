import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserById, getReviewsByUser, canReviewUser, createReview } from "../services/usersServices";
import { DEFAULT_PHOTO } from "@/shared/config";

export default function UserProfile() {
  const { id } = useParams(); // id del usuario
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const userData = await getUserById(id);
        setUser(userData);

        const [reviewsData, canReviewData] = await Promise.all([
          getReviewsByUser(id),
          canReviewUser(id),
        ]);

        setReviews(reviewsData);
        setCanReview(canReviewData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await createReview(id, review);
      setReview("");
      setShowForm(false);

      // refrescar las reviews
      const updated = await getReviewsByUser(id);
      setReviews(updated);
      setCanReview(false); // ya dejó una review
    } catch (err) {
      alert("Error al enviar la reseña: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-center mt-10">Error: {error}</p>;
  if (!user) return <p className="text-center mt-10">Usuario no encontrado.</p>;

  const photoUrl = user.profile_photo_url || DEFAULT_PHOTO;
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

          {reviews.length === 0 ? (
            <p className="text-center text-gray-500">
              Aún no hay reseñas para este usuario.
            </p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((rev) => (
                <li
                  key={rev.id}
                  className="border rounded-lg p-3 bg-gray-50 text-sm"
                >
                 <p>{rev.review}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    — {rev.reviewer?.name} {rev.reviewer?.last_name}
                    {rev.reviewer?.email && (
                      <span className="text-gray-400"> ({rev.reviewer.email})</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}

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

          {/* Formulario para escribir reseña */}
          {showForm && (
            <form onSubmit={handleSubmitReview} className="mt-4 space-y-2">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Escribí tu reseña..."
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg disabled:opacity-60"
                >
                  {submitting ? "Enviando..." : "Confirmar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 px-3 py-1 rounded-lg"
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
