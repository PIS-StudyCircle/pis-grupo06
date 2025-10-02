import { API_BASE } from "@/shared/config";

export const getTutorings = async (page = 1, perPage = 20, filters = {}) => {
  const params = new URLSearchParams({
    page,
    per_page: perPage,
  });

  // agregar filtros dinámicamente
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await fetch(`${API_BASE}/tutorings?${params}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Error al cargar las tutorías");
  return await response.json();

};

export const createTutoringByTutor = async ({
  scheduled_at,
  duration_mins,
  modality,
  capacity,
  created_by_id,
  tutor_id,
  course_id,
  subject_ids,
  location,
}) => {
  const body = {
    tutoring: {
      scheduled_at,
      duration_mins,
      modality,
      capacity,
      created_by_id,
      tutor_id,
      course_id,
      subject_ids,
      location,
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
export const createTutoringByStudent = async ({
  request_due_at,
  request_comment,
  created_by_id,
  course_id, 
  subject_ids,
  modality,
  location,
}) => {
  const body = {
    tutoring: {
      request_due_at,
      request_comment: request_comment?.trim() || undefined,
      created_by_id,
      course_id,
      subject_ids,
      modality,
      location,
    },
  };
  const resp = await fetch(`${API_BASE}/tutorings`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) throw data || { message: "Error al solicitar la tutoría" };
  return data;
};