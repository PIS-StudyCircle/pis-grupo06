import { API_BASE } from "@/shared/config";

const API_URL = `${API_BASE}/users/tutor_reviews`;

export const getReviewsByTutor = async (tutorId) => {
  const res = await fetch(`${API_URL}?tutor_id=${tutorId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener reseñas");
  return await res.json();
};

export const canReviewTutor = async (tutorId) => {
  const res = await fetch(`${API_URL}/can_review?tutor_id=${tutorId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al verificar si se puede dejar reseña");
  const data = await res.json();
  return data.can_review;
};

export const createReview = async (tutorId, review) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tutor_id: tutorId, review }),
  });
  if (!res.ok) throw new Error("Error al crear reseña");
  return await res.json();
};
