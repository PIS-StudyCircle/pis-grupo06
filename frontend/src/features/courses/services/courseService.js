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

// Nuevo servicio para obtener un curso por ID
export const getCourseByID = async (courseId) => {
  const response = await fetch(`${API_BASE}/courses/${courseId}`, {credentials: 'include'});
  if (!response.ok) throw new Error("Error al encontrar el curso");
  return await response.json();
};

async function handleJSON(resp) {
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = resp.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export async function favoriteCourse(id) {
  const r = await fetch(`${API_BASE}/courses/${id}/favorite`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return handleJSON(r);
}

export async function unfavoriteCourse(id) {
  const r = await fetch(`${API_BASE}/courses/${id}/favorite`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return handleJSON(r);
}

export async function getMyFavoriteCourses() {
  const r = await fetch(`${API_BASE}/users/favorite_courses`, { credentials: 'include' });
  if (!r.ok) throw new Error('Error al cargar favoritos');
  return r.json();
}
