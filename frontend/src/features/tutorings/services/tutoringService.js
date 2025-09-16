import { API_BASE } from "@/shared/config";

export const getTutorings = async (page = 1, perPage = 20, search = "") => {
  const params = new URLSearchParams({
    page,
    per_page: perPage,
  });

  if (search) {
    params.append("search", search);
  }

  const response = await fetch(`${API_BASE}/tutorings?${params}`);
  if (!response.ok) throw new Error("Error fetching tutorings");
  return await response.json();
};
