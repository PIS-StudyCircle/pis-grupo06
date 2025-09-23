import { API_BASE } from "@/shared/config";

export const getSubjects = async (courseId, page = 1, perPage = 10, search = "") => {
  const params = new URLSearchParams({
    page,
    per_page: perPage,
  });

  if (courseId) {
    params.append("course_id", courseId);
  }

  if (search) {
    params.append("search", search);
  }

  const response = await fetch(`${API_BASE}/subjects?${params}`);

  if (!response.ok) throw new Error("Error fetching subjects");
  return await response.json();
};