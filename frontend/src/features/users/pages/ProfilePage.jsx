import { useUser } from "@context/UserContext";
import { DEFAULT_PHOTO } from "@/shared/config";
import { TutorSchedulePage, SessionListPage } from "@/features/calendar";

export default function Profile() {
  const { user, loading, error } = useUser();

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error)
    return <p className="text-center mt-10">Error al cargar perfil.</p>;
  if (!user)
    return <p className="text-center mt-10">No hay usuario cargado.</p>;

  const photoUrl = user.photo || DEFAULT_PHOTO;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Perfil */}
        <div className="bg-[#001F54] text-white rounded-3xl shadow-xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Perfil</h2>

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
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg w-full  border border-gray-200">
          <SessionListPage userId={user.id}/>
        </div>
      </div>
    </div>
  );
}
