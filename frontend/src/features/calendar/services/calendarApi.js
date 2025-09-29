import { API_BASE } from "@/shared/config";

const API_URL = `${API_BASE}/calendar/sessions`;
// Función para crear una sesion de clase
export const createClassEvent = async ({
  title,
  description,
  start,
  end,
  attendees,
}) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      start_time: start,
      end_time: end,
      attendees,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al crear el evento");
  }

  return await response.json();
};

// Función para eliminar un evento por su ID
export const deleteEvent = async (eventId) => {
  const response = await fetch(`${API_URL}/${eventId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al eliminar el evento");
  }

  return await response.json();
};

// Función para responder a una invitación de evento
export const respondToEvent = async (eventId, status) => {
  const responseApi = await fetch(`${API_URL}/${eventId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response: status }), 
  });

  if (!responseApi.ok) {
    const errorData = await responseApi.json();
    throw new Error(errorData.error || "Error al responder al evento");
  }

  return await responseApi.json();
};


// Función para obtener las sesiones de un usuario por su ID
export async function getSessionsByUser(userId, type = "all") {
  const res = await fetch(
    `${API_URL}?user_id=${userId}&type=${type}`,
    { credentials: "include" }
  );

  if (!res.ok) throw new Error("Error al obtener sesiones del usuario");

  return res.json();
}

// Función para obtener los eventos de un tutor por su ID (O sea los horarios disponibles)
export const getTutorEvents = async (tutorId) => {
  const res = await fetch(`${API_BASE}/calendar/events?tutor_id=${tutorId}`);
  if (!res.ok) throw new Error("Error al obtener eventos");
  return await res.json();
};
