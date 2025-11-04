import { API_BASE } from "@/shared/config";
import { storeUserMaybe } from "./auth.api";
import { http } from "./https";

const API_URL = `${API_BASE}/users`;

export const getUsers = async (page = 1, perPage = 20, search = "", role = "") => {
  const params = new URLSearchParams({ page, per_page: perPage });
  if (search) params.append("search", search);
  if (role) params.append("role", role);

  const response = await fetch(`${API_URL}?${params}`);
  if (!response.ok & role == "tutor") throw new Error("Error al obtener tutores");
  if (!response.ok) throw new Error("Error al obtener usuarios");

  const data = await response.json();
  return data;
};

export const getUserById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error(`Error al obtener usuario con id ${id}`);
  return await response.json();
};

export async function updateProfile(form, id) {
  const formData = new FormData();

  formData.append("user[name]", form.name);
  formData.append("user[last_name]", form.last_name);
  formData.append("user[description]", form.description || "");

  if (form.profile_photo) {
    formData.append("user[profile_photo]", form.profile_photo);
  }

  const data = await http(`/users/${id}`, {
    method: "PUT",
    body: formData,
  });

  return storeUserMaybe(data);
};

export const getReviewsByUser = async (userId) => {
  const res = await fetch(`${API_URL}/user_reviews?reviewed_id=${userId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener reseñas");
  return await res.json();
};

export const canReviewUser = async (userId) => {
  const res = await fetch(`${API_URL}/user_reviews/can_review?reviewed_id=${userId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al verificar si se puede dejar reseña");
  const data = await res.json();
  return data.can_review;
};

export const createReview = async (userId, review) => {
  const res = await fetch(`${API_URL}/user_reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reviewed_id: userId, review }),
  });
  if (!res.ok) throw new Error("Error al crear reseña");
  return await res.json();
};

export const updateReview = async (reviewId, review) => {
  const res = await fetch(`${API_URL}/user_reviews/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ review }),
  });

  if (!res.ok) throw new Error("Error al actualizar reseña");
  return await res.json();
};

export const deleteReview = async (reviewId) => {
  const res = await fetch(`${API_URL}/user_reviews/${reviewId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al eliminar reseña");
};
