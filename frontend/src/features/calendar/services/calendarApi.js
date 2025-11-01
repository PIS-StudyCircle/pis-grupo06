import { API_BASE } from "@/shared/config";
const API_URL = `${API_BASE}/calendar/sessions`;

// Crear una sesión de clase (el tutor crea el evento)
export const createClassEvent = async ({ tutoringId, title, description, start, end }) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      tutoring_id: tutoringId,
      title,
      description,
      start_time: start,
      end_time: end,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al crear el evento");
  }
  return await response.json();
};

// Unirse a una sesión (el estudiante se agrega como attendee)
export const joinClassEvent = async (tutoringId) => {
  console.log("Joining tutoring with ID:", tutoringId); // Log para depuración
  const response = await fetch(`${API_URL}/${tutoringId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al unirse al evento");
  }
  return await response.json();
};

// Ver un evento puntual
export const getClassEvent = async (tutoringId) => {
  const response = await fetch(`${API_URL}/${tutoringId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al obtener el evento");
  }
  return await response.json();
};

// Obtener los próximos 10 eventos del calendario del usuario actual
export const getUpcomingEvents = async () => {
  const response = await fetch(`${API_URL}/upcoming`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al obtener próximos eventos");
  }
  return await response.json();
};

// Eliminar un evento
export const deleteClassEvent = async (tutoringId) => {
  const response = await fetch(`${API_URL}/${tutoringId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al eliminar el evento");
  }
  return await response.json();
};

// Desuscribirse de una sesión/tutoría (igual que en tutorías)
export const unsubscribeFromClassEvent = async (tutoringId) => {
  if (!tutoringId) throw new Error("Falta el ID de la tutoría");

  const response = await fetch(`${API_BASE}/tutorings/${tutoringId}/unsubscribe`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (response.status === 204) return null;

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al desuscribirse de la tutoría");
  }

  try { return await response.json(); } catch { return null; }
};