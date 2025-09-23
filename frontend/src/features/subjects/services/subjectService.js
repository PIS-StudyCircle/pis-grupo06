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