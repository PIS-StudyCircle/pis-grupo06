import { useState } from "react";
import { useUser } from "@context/UserContext";
import { updateReview, deleteReview } from "../services/usersServices";
import { Pencil, Trash2 } from "lucide-react";

export default function ReviewsList({ reviews, onUpdate }) {
    const { user } = useUser();
    const [editingId, setEditingId] = useState(null);
    const [editedText, setEditedText] = useState("");
    const [loadingAction, setLoadingAction] = useState(false);

    if (!reviews || reviews.length === 0) {
    return <p className="text-center text-gray-500">Aún no hay reseñas.</p>;
    }

    const handleEdit = (review) => {
    setEditingId(review.id);
    setEditedText(review.review);
    };

    const handleCancel = () => {
    setEditingId(null);
    setEditedText("");
    }; 

    const handleSave = async (reviewId, e) => {
    e.preventDefault();

    try {
        setLoadingAction(true);
        await updateReview(reviewId, editedText);
        setEditingId(null);
        setEditedText("");
        onUpdate?.();
    } catch (err) {
        alert("Error al actualizar la reseña: " + err.message);
    } finally {
        setLoadingAction(false);
    }
    };

    const handleDelete = async (reviewId) => {
    if (loadingAction) return; 

    try {
        setLoadingAction(true);
        await deleteReview(reviewId);
        onUpdate?.();
    } catch (err) {
        if (err.message.includes("404")) return;
    } finally {
        setLoadingAction(false);
    }
    };

    return (
    <ul className="space-y-3">
        {reviews.map((rev) => {
        const isOwn = user && rev.reviewer?.id === user.id;

        return (
        <li
        key={rev.id}
        className="border rounded-lg p-3 bg-gray-50 text-sm relative overflow-hidden"
        >
        {/* --- Si está en edición --- */}
        {editingId === rev.id ? (
            <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSave(rev.id, e);
            }}
            className="space-y-3"
            >
            <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full border rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="Editá tu reseña..."
                required
            />
            <div className="flex gap-2 justify-end">
                <button
                type="submit"
                disabled={loadingAction}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-60"
                >
                {loadingAction ? "Guardando..." : "Guardar"}
                </button>
                <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 px-4 py-1.5 rounded-lg hover:bg-gray-400 transition"
                >
                Cancelar
                </button>
            </div>
            </form>
        ) : (
            <>
            {/* --- Texto normal --- */}
            <div
                className={`break-words whitespace-pre-wrap ${
                isOwn ? "pr-10" : ""
                }`}
            >
                <p className="font-semibold text-black">{rev.review}</p>
                <p className="text-xs text-gray-500 mt-1">
                — {isOwn ? "Tú" : `${rev.reviewer?.name} ${rev.reviewer?.last_name}`}
                {!isOwn && rev.reviewer?.email_masked && (
                    <span className="text-gray-400"> ({rev.reviewer.email_masked})</span>
                )}
                </p>
            </div>
            </>
        )}

        {/* --- Botones de acciones --- */}
        {isOwn && editingId !== rev.id && (
            <div className="absolute top-2 right-2 flex gap-2">
            <button
                onClick={() => handleEdit(rev)}
                title="Editar reseña"
                className="text-black hover:scale-110 transition-transform"
            >
                <Pencil size={18} strokeWidth={1.75} color="blue" />
            </button>
            <button
                onClick={() => handleDelete(rev.id)}
                title="Eliminar reseña"
                disabled={loadingAction}
                className="text-black hover:scale-110 transition-transform"
            >
                <Trash2 size={18} strokeWidth={1.75} color="red" />
            </button>
            </div>
        )}
        </li>
        );
        })}
    </ul>
    );
    }
