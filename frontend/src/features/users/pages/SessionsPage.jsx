import { useUser } from "@context/UserContext";
import { SessionListPage } from "@/features/calendar";
import { useState } from "react";

export default function Sessions() {
  const { user, loading, error } = useUser();
   const [isBlockingPage, setIsBlockingPage] = useState(false);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  
  if (error) {
    console.error('Error loading user:', error); 
    return <p className="text-center mt-10">Error al cargar notificaciones.</p>;
  }
  
  if (!user)
    return <p className="text-center mt-10">No hay usuario cargado.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg w-full border border-gray-200">
          <SessionListPage
            userId={user.id}
            type="upcoming"
            isBlockingPage={isBlockingPage}
            setIsBlockingPage={setIsBlockingPage}
          />
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg w-full border border-gray-200">
          <SessionListPage
            userId={user.id}
            type="finalized"
            isBlockingPage={isBlockingPage}
            setIsBlockingPage={setIsBlockingPage}
          />
        </div>
      </div>
    </div>
  );
}
