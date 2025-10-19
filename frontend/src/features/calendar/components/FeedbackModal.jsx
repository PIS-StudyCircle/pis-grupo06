import { Star, X } from "lucide-react";
import { useState } from "react";
import { createFeedback } from "../hooks/useFeedback";
import {showSuccess, showError} from "@/shared/utils/toastService";

export default function FeedbackModal({
  sessionId,
  tutor,
  tutoria,
  onClose,
  onSubmit,
}) {
  const [setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (comment.trim() === "") return;
    try {
        const result = await createFeedback(sessionId, comment);
        showSuccess("Feedback enviado con éxito!");
        onSubmit(result.feedback);
        setRating(0);
        setComment("");
        onClose();
    } catch (error) {
        showError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          <span className="block">
            Feedback para <span className="font-bold text-blue-700">{tutor}</span>
          </span>
          <span className="block text-sm text-gray-500 mt-1 italic">
            {tutoria}
          </span>
        </h2>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Escribe tu comentario sobre la tutoría..."
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        />

        {/* Botones */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={comment.trim() === ""}
            className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition ${
              comment.trim() === ""
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
