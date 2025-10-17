import { API_BASE } from "@/shared/config";

const filtersFromMode = (mode) => {
  switch (mode) {
    case "serTutor":
      return { no_tutor: true };
    case "serEstudiante":
      return { with_tutor: true };
    case "misTutorias":
      return { enrolled: true };
    default:
      return {};
  }
};

export const getTutorings = async (page = 1, perPage = 20, filters = {}, mode = "") => {
  // merge de filtros del mode + filtros adicionales que vengan de la UI
  const finalFilters = { ...filters, ...filtersFromMode(mode) };

  const params = new URLSearchParams({
    page,
    per_page: perPage,
  });


  Object.entries(finalFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE}/tutorings?${params}`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Error al cargar las tutorías");
  return await response.json();
};


export const createTutoringByTutor = async (payload) => {
  // Validación básica
  if (!payload.availabilities_attributes?.length) {
    throw { message: "Debe incluir al menos una disponibilidad" };
  }

  const body = {
    tutoring: {
      modality: payload.modality,
      capacity: payload.capacity,
      creator_id: payload.creator_id,
      tutor_id: payload.tutor_id,
      course_id: payload.course_id,
      subject_ids: payload.subject_ids,
      location: payload.location?.trim() || undefined,
      availabilities_attributes: payload.availabilities_attributes,
    }
  };

  const resp = await fetch(`${API_BASE}/tutorings`, {
    method: 'POST',
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    throw data || { message: "Error al crear la tutoría" };
  }

  return data;
};

// --- ESTUDIANTE solicita una tutoría (pending) ---
export const createTutoringByStudent = async (payload) => {
  // Validación básica
  if (!payload.availabilities_attributes?.length) {  // ✅ Cambio aquí
    throw { message: "Debe incluir al menos una disponibilidad" };
  }

  const body = {
    tutoring: {
      request_due_at: payload.request_due_at,
      request_comment: payload.request_comment?.trim() || undefined,
      created_by_id: payload.created_by_id,
      course_id: payload.course_id,
      subject_ids: payload.subject_ids,
      modality: payload.modality,
      location: payload.location?.trim() || undefined,
      availabilities_attributes: payload.availabilities_attributes,  // ✅ Cambio aquí
    },
  };
  
  const resp = await fetch(`${API_BASE}/tutorings`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    throw data || { message: "Error al solicitar la tutoría" };
  }
  
  return data;
};

export const unsubscribeFromTutoring = async (tutoringId) => {
  if (!tutoringId) throw { message: "Falta el ID de la tutoría" };

  const resp = await fetch(`${API_BASE}/tutorings/${tutoringId}/unsubscribe`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Puede venir 204 No Content
  if (resp.status === 204) return null;

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    throw data || { message: "Error al desuscribirse de la tutoría" };
  }

  return data;
};