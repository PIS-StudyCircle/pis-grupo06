import { useUser } from "@context/UserContext"; 
import DeleteAccountButton from "./DeleteAccountButton";

export default function Profile() {
  const { user, loading, error } = useUser(); 

  if (loading) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  if (error) {
    return <p className="text-center mt-10">Error al cargar perfil.</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">No hay usuario cargado.</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-[#001F54] text-white rounded-3xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Perfil</h2>

        <div className="flex flex-col items-center mb-6">
          <img
            src="/src/assets/avatar.png"
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
        {/* Botón eliminar cuenta */}
        <div className="mt-6">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
