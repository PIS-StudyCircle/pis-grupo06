import { API_BASE } from "@/shared/config";

const API_URL = `${API_BASE}/users/list`;

export const getUsers = async (page = 1, perPage = 20, search = "", role = "") => {
  const params = new URLSearchParams({ page, per_page: perPage });
  if (search) params.append("search", search);
  if (role) params.append("role", role);

  const response = await fetch(`${API_URL}?${params}`);
  if (!response.ok) throw new Error("Error al obtener usuarios");
  return await response.json();
};
