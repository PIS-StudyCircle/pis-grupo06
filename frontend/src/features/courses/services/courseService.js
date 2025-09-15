import { API_BASE } from "@/shared/config";

export const getCourses = async (page = 1, perPage = 20, search = "") => {
  const params = new URLSearchParams({
    page,
    per_page: perPage,
  });

  if (search) {
    params.append("search", search);
  }

  const response = await fetch(`${API_BASE}/courses?${params}`);
  if (!response.ok) throw new Error("Error fetching courses");
  return await response.json();
};
