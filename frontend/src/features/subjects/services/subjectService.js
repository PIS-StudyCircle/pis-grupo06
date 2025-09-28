import { API_BASE } from "@/shared/config";

export const getSubjects = async (courseId, page = 1, perPage = 10, search = "") => {
  const params = new URLSearchParams({
    course_id: courseId,
    page,
    per_page: perPage,
  });

  if (search) {
    params.append("search", search);
  }
  const response = await fetch(`${API_BASE}/subjects?${params}`);
  
  if (!response.ok) throw new Error("Error al obtener los temas");
  return await response.json();
};

export const getSubject = async (subjectId) => {
  const response = await fetch(`${API_BASE}/subjects/${subjectId}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Error al obtener el tema");
  }
  
  return await response.json();
};

export const createSubject = async ({ name, course_id}) => {

  const body = { subject: { name, course_id} };

  const resp = await fetch(`${API_BASE}/subjects`, {
    method: 'POST',
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    throw data || { message: "Error al crear el tema" };
  }

  return data;
};