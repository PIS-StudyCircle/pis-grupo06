import { useUser } from "@context/UserContext";
import { SessionListPage } from "@/features/calendar";
import { useNotifications } from "@/context/NotificationsContext";

export default function Notifications() {
  const { user, loading, error } = useUser();
  const { setNotifications } = useNotifications();

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error)
    return <p className="text-center mt-10">Error al cargar notificaciones.</p>;
  if (!user)
    return <p className="text-center mt-10">No hay usuario cargado.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="max-w-3xl w-full">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg w-full border border-gray-200">
          <SessionListPage
            userId={user.id}
            type="invited"
            onCountChange={(n) => setNotifications(n)}
          />
        </div>
      </div>
    </div>
  );
}
