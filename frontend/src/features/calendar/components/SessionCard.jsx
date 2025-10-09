import { Calendar, Clock, User, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { useUser } from "@context/UserContext";

export default function SessionCard({ session }) {
  const [showAttendees, setShowAttendees] = useState(false);
  const { user } = useUser();

  const formatDate = (date) =>
    date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date) =>
    date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

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


  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-[1.01] transition transform">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            <a
              href={session.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-800"
            >
              {session.subject}
            </a>
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
          {session.status}
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
      </div>
  );
}
