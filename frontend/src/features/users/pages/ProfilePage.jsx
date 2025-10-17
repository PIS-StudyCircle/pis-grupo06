import { useUser } from "@context/UserContext"; 
import { DEFAULT_PHOTO } from "@/shared/config";
import { useUserReviews } from "../hooks/useUserReviews";
import ReviewsList from "../components/ReviewsList";
import { useState, useEffect } from "react";
import { getCourses } from "../../courses/services/courseService";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function Profile() {
  const { user, loading, error } = useUser(); 
  const { reviews, loading: reviewsLoading, error: reviewsError } = useUserReviews(user?.id);

  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState("");
  const [favorites, setFavorites] = useState([{id: "", name: "", code: ""}]);

  // --- Traer favoritas al montar (suficiente si no querés “en vivo”) ---
  useEffect(() => {
    if (!user) return;
    fetchFavorites();
  }, [user]);

  async function fetchFavorites() {
    try {
      setFavError("");
      setFavLoading(true);
      const data = await getCourses(1, 50, "", true);

      setFavorites(data.courses);
    } catch (e) {
      setFavError(e?.payload?.error || e?.message || "Error al cargar favoritas.");
    } finally {
      setFavLoading(false);
    }
  }

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
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl p-4 md:p-8">
        <div className="space-y-6 md:space-y-0 md:flex md:items-start md:gap-6">
          
          {/* Panel izquierdo: Perfil */}
          <div className="bg-[#001F54] text-white rounded-3xl shadow-xl w-full md:basis-1/2 p-6">
            
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
                  {user.description && (
                    <div>
                      <label className="block text-sm">Descripción</label>
                      <textarea
                        value={user.description}
                        readOnly
                        rows={3}
                        className="w-full rounded-lg px-3 py-2 text-black bg-white/90"
                      />
                    </div>
                  )}

              </div>

              {/* Panel derecho: Favoritas */}
              <div className="bg-white rounded-3xl shadow-xl w-full md:basis-1/2 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Materias favoritas
                  </h2>
                </div>

                <div>

                  {favLoading && <p className="text-gray-500">Cargando…</p>}

                  {favError && (
                    <div className="text-red-600">
                      {favError}{" "}
                      <button className="underline" onClick={fetchFavorites}>
                        Reintentar
                      </button>
                    </div>
                  )}

                  {!favLoading && !favError && favorites.length === 0 && (
                    <p className="text-gray-500">Aún no tenés materias favoritas.</p>
                  )}

                  {!favLoading && !favError && favorites.length > 0 && (
                    <ul className="divide-y divide-gray-100 overflow-y-auto max-h-full">
                      {favorites.map((c) => (
                        <li key={c.id} className="py-3">
                          <Link
                            to={`/materias/${c.id}`}
                            state={{ fromFavs: true }}
                            className="flex items-center justify-between group"
                            title={c.name}
                          >
                            <span className="truncate font-medium group-hover:underline">
                              {c.name}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
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
    </div>
  );
}
