import { Calendar, Clock, User, MapPin, Users } from "lucide-react";
import { deleteEvent } from "../services/calendarApi";
import { showSuccess, showError, showConfirm } from "@utils/toastService";
import { useState } from "react";

export default function SessionCard({ session, refresh }) {
  const [showAttendees, setShowAttendees] = useState(false);

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
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-[1.01] transition transform">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {session.subject}
          </h3>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <User className="w-4 h-4" />
            <span className="text-sm">{session.tutor}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(session.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {formatTime(session.date)} ({session.duration} min)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{session.location}</span>
        </div>
      </div>

      {/* Temas */}
      {session.topics && session.topics.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-500 mb-2">Temas a tratar:</p>
          <div className="flex flex-wrap gap-2">
            {session.topics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Asistentes */}
      {session.attendees && session.attendees.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowAttendees(!showAttendees)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            <Users className="w-4 h-4" />
            {showAttendees ? "Ocultar participantes" : "Ver participantes"}
          </button>

          {showAttendees && (
            <ul className="mt-2 space-y-1 text-sm">
              {session.attendees.map((attendee, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded"
                >
                  <span className="text-gray-700">{attendee.email}</span>
                  <span
                    className={
                      attendee.status === "confirmada"
                        ? "text-green-600 font-medium"
                        : attendee.status === "tentativa"
                        ? "text-yellow-600 font-medium"
                        : attendee.status === "rechazada"
                        ? "text-red-600 font-medium"
                        : attendee.status === "pendiente"
                        ? "text-gray-500 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {attendee.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
        {session.status === "pendiente" && (
          <button className="text-green-600 hover:text-green-800 text-sm font-semibold hover:underline">
            Confirmar
          </button>
        )}
        {session.status !== "cancelada" && (
          <button
            onClick={() => handleCancel(session.id, refresh)}
            className="ml-auto text-red-600 hover:text-red-800 text-sm font-semibold hover:underline"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
