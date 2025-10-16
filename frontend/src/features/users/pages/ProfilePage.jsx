import { useUser } from "@context/UserContext"; 
import { DEFAULT_PHOTO } from "@/shared/config";
import { useUserReviews } from "../hooks/useUserReviews";
import ReviewsList from "../components/ReviewsList";

export default function Profile() {
  const { user, loading, error } = useUser(); 
  const { reviews, loading: reviewsLoading, error: reviewsError } = useUserReviews(user?.id);

  if (loading) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  if (error) {
    return <p className="text-center mt-10">Error al cargar perfil.</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">No hay usuario cargado.</p>;
  }

  const photoUrl = user.profile_photo_url || DEFAULT_PHOTO;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-[#001F54] text-white rounded-3xl shadow-xl w-full max-w-md p-6">

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
            <label className="block text-sm">Email</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full rounded-lg px-3 py-2 text-black bg-white opacity-80"
            />
          </div>

          {user.description && (
            <div>
              <label className="block text-sm">Descripción</label>
              <textarea
                value={user.description}
                readOnly
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-black bg-white opacity-80"
              />
            </div>
          )}
        </div>

        {/* --- Sección de Reseñas --- */}
        <div className="bg-white text-black rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-2 text-center text-[#001F54]">
            Mis reseñas
          </h3>

          {reviewsLoading && (
            <p className="text-center text-gray-500">Cargando reseñas...</p>
          )}

          {reviewsError && (
            <p className="text-center text-red-500">Error al cargar reseñas.</p>
          )}

          {!reviewsLoading && !reviewsError && (
            <ReviewsList reviews={reviews} />
          )}
        </div>

      </div>
    </div>
  );
}
