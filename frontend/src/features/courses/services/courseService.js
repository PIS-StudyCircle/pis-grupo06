import { API_URL } from "../../../config";

export async function getCourses(page = 1, perPage = 10) {
  const res = await fetch(`${API_URL}/api/v1/courses?page=${page}&per_page=${perPage}`);
  if (!res.ok) throw new Error("Error al obtener cursos");
  return res.json();
}

// export const getCourses = async (page = 1, perPage = 20) => {
//   const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/courses?page=${page}&per_page=${perPage}`);
//   if (!res.ok) throw new Error("Failed to fetch courses");
//   return res.json(); // should return { courses: [...], pagination: {...} }
// };
