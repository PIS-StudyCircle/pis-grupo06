import { useState } from "react";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { useUser } from "@context/UserContext";
import { SessionListPage } from "@/features/calendar";

export default function Sessions() {
  const { user, loading, error } = useUser();
   const [isBlockingPage, setIsBlockingPage] = useState(false);

  const [open, setOpen] = useState({
    upcoming: true,
    finalized: false,
    my_pendings: false,
  });

  const toggle = (section) => {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-center mt-10">Error al cargar usuario.</p>;
  if (!user) return <p className="text-center mt-10">No hay usuario cargado.</p>;

  const sections = [
    { type: "upcoming", title: "Mis próximas sesiones" },
    { type: "finalized", title: "Mis sesiones finalizadas" },
    { type: "my_pendings", title: "Mis sesiones pendientes" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="max-w-3xl w-full space-y-8">

        {sections.map(({ type, title }) => (
          <div
            key={type}
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg w-full border border-gray-200"
          >
            <button
              onClick={() => toggle(type)}
              className="w-full px-6 py-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {title}
                </h2>
              </div>

              {open[type] ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                open[type]
                  ? "max-h-[4000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <SessionListPage userId={user.id} type={type} isBlockingPage={isBlockingPage}
                setIsBlockingPage={setIsBlockingPage} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
