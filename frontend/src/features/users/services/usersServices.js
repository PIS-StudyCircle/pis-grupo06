import { API_BASE } from "@/shared/config";

const API_URL = `${API_BASE}/users`;

export const getUsers = async (page = 1, perPage = 20, search = "", role = "") => {
  const params = new URLSearchParams({ page, per_page: perPage });
  if (search) params.append("search", search);
  if (role) params.append("role", role);

  const response = await fetch(`${API_URL}?${params}`);
  if (!response.ok & role == "tutor") throw new Error("Error al obtener tutores");
  if (!response.ok) throw new Error("Error al obtener usuarios"); 

  const data = await response.json(); 
  return data;
};


export const getUserById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error(`Error al obtener usuario con id ${id}`);
  return await response.json();
};