import { Calendar, Clock, User, MapPin } from "lucide-react";
import { deleteEvent } from "../services/calendarApi";
import { showSuccess, showError, showConfirm } from "@utils/toastService";

export default function SessionCard({ session, refresh }) {
  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmada":
        return "bg-green-100 text-green-800 border-green-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmada":
        return "Confirmada";
      case "pendiente":
        return "Pendiente";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };
  const handleCancel = (sessionId, refresh) => {
    showConfirm(
      "¿Seguro que deseas cancelar esta tutoría?",
      async () => {
        try {
          await deleteEvent(sessionId);
          showSuccess("Evento cancelado correctamente");
          if (refresh) refresh();
        } catch (err) {
          showError("Error al cancelar: " + err.message);
        }
      },
      () => {
        console.log("Cancelado por el usuario");
      }
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {session.subject}
            </h3>
            <div className="flex items-center gap-1 text-gray-600 mt-1">
              <User className="w-4 h-4" />
              <span className="text-sm">{session.tutor}</span>
            </div>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            session.status
          )}`}
        >
          {getStatusText(session.status)}
        </div>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(session.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {formatTime(session.date)} ({session.duration} min)
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{session.location}</span>
        </div>
      </div>

      {/* Temas */}
      {session.topics && session.topics.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">Temas a tratar:</p>
          <div className="flex justify-center flex-wrap gap-2">
            {session.topics.map((topic, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Ver detalles
        </button>
        {session.status === "pendiente" && (
          <>
            <span className="text-gray-300">|</span>
            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
              Confirmar
            </button>
          </>
        )}
        {session.status !== "cancelada" && (
          <>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => handleCancel(session.id, refresh)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
