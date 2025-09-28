import { API_BASE } from "@/shared/config";

// Función para crear una sesion de clase
export const createClassEvent = async ({
  title,
  description,
  start,
  end,
  attendees,
}) => {
  const response = await fetch(`${API_BASE}/calendar/sessions`, {
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
  const response = await fetch(`${API_BASE}/calendar/sessions/${eventId}`, {
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

// Función para obtener las sesiones de un usuario por su ID
export async function getSessionsByUser(userId) {
  const res = await fetch(`${API_BASE}/calendar/sessions?user_id=${userId}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al obtener sesiones del usuario");

  return res.json();
}

// Función para obtener los eventos de un tutor por su ID (O sea los horarios disponibles)
export const getTutorEvents = async (tutorId) => {
  const res = await fetch(`${API_BASE}/calendar/events?tutor_id=${tutorId}`);
  if (!res.ok) throw new Error("Error al obtener eventos");
  return await res.json();
};
