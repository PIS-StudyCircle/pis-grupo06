import { Calendar, Clock, User, MapPin, Users, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Agregar esta importación
import FeedbackModal from "./FeedbackModal";
import { hasFeedback } from "../hooks/useFeedback";
import { useUser } from "@context/UserContext";
import { handleCancel } from "@/features/calendar/hooks/useCancelSession";

export default function SessionCard({ session, type = "all", refresh }) {
  const [showAttendees, setShowAttendees] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const { user } = useUser();
  const navigate = useNavigate(); // Agregar esta línea

  useEffect(() => {
    if (type === "finalized" && user?.id) {
      async function checkFeedback() {
        try {
          setLoadingFeedback(true);
          const res = await hasFeedback(user.id, session.id);
          if (res.has_feedback) setUserRating(Number(res.rating));
        } catch (err) {
          console.error("Error al verificar feedback:", err);
        } finally {
          setLoadingFeedback(false);
        }
      }
      checkFeedback();
    }
  }, [session.id, session.tutor_id, type, user?.id]);

  const esTutor = user?.id === session?.tutor_id;

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

  const handleDesuscribirmeClick = (session, e) => {
    if (e) e.stopPropagation(); // Evitar propagación del evento
    if (!session) return;
    handleCancel(session.id, refresh);
  };

  const handleSubmitReview = (rating) => {
    let value = rating;
    if (value && typeof value === "object") {
      value = value.rating ?? value?.rating;
    }
    if (value == null) return;
    setShowFeedbackModal(false);
    setUserRating(Number(value));
  };

  // Nuevo manejador para redirigir a la show page
  const handleCardClick = () => {
    if (session?.id) {
      navigate(`/tutorias/${session.id}`);
    }
  };

  // Manejador para evitar propagación en botones específicos
  const handleButtonClick = (e, callback) => {
    e.stopPropagation();
    if (callback) callback();
  };

  const StarRow = ({ value }) => {
    const fillFor = (i) => Math.max(0, Math.min(1, value - (i - 1)));
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = fillFor(i);
          return (
            <span
              key={i}
              className="relative inline-block w-5 h-5 align-middle"
            >
              <span className="absolute inset-0 text-gray-300">
                <Star
                  className="w-5 h-5"
                  style={{ fill: "transparent" }}
                  color="currentColor"
                />
              </span>
              <span
                className="absolute inset-0 text-yellow-500 overflow-hidden pointer-events-none"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className="w-5 h-5"
                  style={{ fill: "currentColor" }}
                  color="currentColor"
                />
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div
        className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-[1.01] transition transform cursor-pointer"
        onClick={handleCardClick}
      >
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
              <span className="text-sm">
                {session.role === "tutor" ? "Tú (tutor)" : session.tutor}
              </span>
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
          <>
            <div className="mt-4">
              <button
                onClick={(e) =>
                  handleButtonClick(e, () => setShowAttendees(!showAttendees))
                }
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
                      <span className="text-gray-700">
                        {attendee.id === user?.id ? "Tú" : attendee.email}
                      </span>
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
            {type !== "finalized" && (
              <button
                type="button"
                className="btn w-full bg-red-500 hover:bg-red-600 text-white mt-3"
                onClick={(e) => handleDesuscribirmeClick(session, e)}
              >
                Desuscribirme
              </button>
            )}
          </>
        )}

        {type === "finalized" && (
          <div className="mt-6 flex justify-end">
            {loadingFeedback ? (
              <span className="text-sm text-gray-500">Cargando...</span>
            ) : userRating != null && Number.isFinite(Number(userRating)) ? (
              <div className="flex items-center gap-2 text-gray-700">
                <StarRow value={Number(userRating)} />
                <span className="text-sm">
                  ({Number(userRating).toFixed(1)}/5)
                </span>
              </div>
            ) : (
              !esTutor && (
                <button
                  onClick={(e) =>
                    handleButtonClick(e, () => setShowFeedbackModal(true))
                  }
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <Star className="w-4 h-4" />
                  Dejar feedback
                </button>
              )
            )}
          </div>
        )}
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          sessionId={session.id}
          reviewedId={session.tutor_id}
          tutor={session.tutor}
          tutoria={session.subject}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={(rating) => handleSubmitReview(rating)}
        />
      )}
    </>
  );
}
