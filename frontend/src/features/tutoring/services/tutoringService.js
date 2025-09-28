import { API_BASE } from "@/shared/config";

export const createTutoringByTutor = async ({
  title,
  description,
  scheduled_at,
  duration_mins,
  modality,
  capacity,
  tutor_id,
  course_id,
  subject_ids,
}) => {
  const body = {
    tutoring: {
      //title,
      //description,
      scheduled_at,
      duration_mins,
      modality,
      capacity,
      //tutor_id,
      //course_id,
      //subject_ids,
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