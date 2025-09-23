import { API_BASE } from "@/shared/config";

export const getTutorings = async (page = 1, perPage = 20, filters = {} ) => {
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
