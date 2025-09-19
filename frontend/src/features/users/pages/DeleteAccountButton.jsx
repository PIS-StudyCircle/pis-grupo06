import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@context/UserContext";

export default function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const { signOut } = useUser();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/users", {
        method: "DELETE",
        credentials: "include", // importante para cookies / JWT
      });

      if (!res.ok) {
        throw new Error("Error al eliminar la cuenta");
      }

      // Limpia el usuario del contexto y redirige
      signOut();
      navigate("/iniciar_sesion");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
        >
          Eliminar cuenta
        </button>
      ) : (
        <div className="w-full bg-red-100 text-red-800 p-4 rounded-lg shadow-md">
          <p className="mb-3 font-medium">
            ¿Estás seguro de que querés eliminar tu cuenta? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-between">
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition"
            >
              Sí, eliminar
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-md transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
