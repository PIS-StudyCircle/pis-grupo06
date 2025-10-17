import { API_BASE } from "@/shared/config";

const filtersFromMode = (mode) => {
  switch (mode) {
    case "serTutor":
      return { no_tutor: true };
    // case "serEstudiante":
    //   return { with_tutor: true };
    // Se comenta ya que un estudiante puede unirse a una tutoria pending sin tutor asignado, no lo borro por si hay que hacer alguna 
    // validacion que se me esté pasando
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

export async function getTutoring(tutoringId) {
  const res = await fetch(`${API_BASE}/tutorings/${tutoringId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener tutoría");
  return res.json();
}

export async function confirmSchedule(tutoringId, payload) {
  const res = await fetch(`${API_BASE}/tutorings/${tutoringId}/confirm_schedule`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // Log útil y mensaje claro
    const raw = await res.text().catch(() => "");
    let parsed = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch {}
    const msg = (parsed && (parsed.error || parsed.message)) || raw || "Error al confirmar la tutoría.";
    console.error("confirmSchedule error:", res.status, res.statusText, raw);
    const err = new Error(msg);
    err.status = res.status;
    err.body = parsed || raw;
    throw err;
  }

  try { return await res.json(); } catch { return {}; }
}