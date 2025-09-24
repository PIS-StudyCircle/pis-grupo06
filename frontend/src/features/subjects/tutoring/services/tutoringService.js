import { API_BASE } from "@/shared/config";

export const createTutoringByTutor = async ({ user_id, course_id, subject_ids, title, description, start_date = null, end_date = null, mode = null }) => {

  const body = { tutoring: { user_id, course_id, subject_ids, title, description, start_date, end_date, mode } };

  const resp = await fetch(`${API_BASE}/tutoring`, {
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