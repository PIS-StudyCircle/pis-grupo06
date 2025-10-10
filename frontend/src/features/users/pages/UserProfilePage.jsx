import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserById } from "../services/usersServices";
import { DEFAULT_PHOTO } from "@/shared/config";

export default function UserProfile() {
  const { id } = useParams(); // obtiene el id de la URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getUserById(id)
      .then((data) => setUser(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  if (error) {
    return <p className="text-center mt-10">Error: {error}</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Usuario no encontrado.</p>;
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

        <div className="space-y-4">
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
      </div>
    </div>
  );
}
