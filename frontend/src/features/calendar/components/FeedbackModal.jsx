import { Star, X } from "lucide-react";
import { useState } from "react";
import { createFeedback } from "../hooks/useFeedback";
import { showSuccess, showError } from "@/shared/utils/toastService";

export default function FeedbackModal({
  sessionId,
  tutor,
  tutoria,
  onClose,
  onSubmit,
}) {
  const [rating, setRating] = useState(0);       
  const [tempRating, setTempRating] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  const current = tempRating || rating;

  const handleSubmit = async () => {
    if (rating <= 0) return;
    try {
      const result = await createFeedback(sessionId, rating);
      showSuccess("¡Calificación enviada con éxito!");
      onSubmit?.(result?.feedback ?? { rating });
      setRating(0);
      onClose();
    } catch (error) {
      showError(error?.message ?? "No se pudo enviar la calificación");
    }
  };

  const fillFor = (starValue) =>
    Math.max(0, Math.min(1, current - (starValue - 1)));

  const decideHalfOrFull = (e, starValue) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX ?? (e.touches?.[0]?.clientX ?? rect.left)) - rect.left;
    const isHalf = x < rect.width / 2 ? 0.5 : 1;
    return (starValue - 1) + isHalf; 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Calificar a <span className="font-bold text-blue-700">{tutor}</span>
        </h2>
        <p className="text-sm text-gray-500 mb-5 italic">{tutoria}</p>

        {/* Estrellas con medias */}
        <div
          className="flex items-center justify-center gap-2 mb-6"
          role="radiogroup"
          aria-label="Calificación"
        >
          {stars.map((value) => {
            const fill = fillFor(value); // 0 | 0.5 | 1
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={
                  current >= value - 0.5 && current < value ? "mixed" : current >= value
                }
                aria-label={`${Math.round(rating * 2) / 2} estrellas`}
                onMouseMove={(e) => setTempRating(decideHalfOrFull(e, value))}
                onMouseLeave={() => setTempRating(0)}
                onClick={(e) => setRating(decideHalfOrFull(e, value))}
                onTouchStart={(e) => setTempRating(decideHalfOrFull(e, value))}
                onTouchEnd={(e) => {
                  setRating(decideHalfOrFull(e, value));
                  setTempRating(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setRating(value);
                  if (e.key === "ArrowRight")
                    setRating((r) => Math.min(5, +(r + 0.5).toFixed(1)));
                  if (e.key === "ArrowLeft")
                    setRating((r) => Math.max(0.5, +(r - 0.5).toFixed(1)));
                  if (e.key === "Home") setRating(0.5);
                  if (e.key === "End") setRating(5);
                }}
                className="relative p-1"
              >
                {/* Contenedor exacto de la estrella */}
                <span className="relative inline-block w-8 h-8 align-middle">
                  {/* Base gris (contorno) */}
                  <span className="absolute inset-0 text-gray-300">
                    <Star
                      className="w-8 h-8"
                      style={{ fill: "transparent" }}
                      color="currentColor"
                    />
                  </span>
                  {/* Overlay amarillo clippeado por ancho (FIX: inset-0) */}
                  <span
                    className="absolute inset-0 text-yellow-500 overflow-hidden pointer-events-none"
                    style={{ width: `${fill * 100}%` }} // 0, 50 o 100%
                  >
                    <Star
                      className="w-8 h-8"
                      style={{ fill: "currentColor" }}
                      color="currentColor"
                    />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Botones */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating <= 0}
            className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition ${
              rating <= 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
