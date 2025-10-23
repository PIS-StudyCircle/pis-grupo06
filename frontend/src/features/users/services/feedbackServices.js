import { API_BASE } from "@/shared/config";

const API_URL = `${API_BASE}/users/user_feedbacks`;

export async function getFeedbacks(tutor_id = null) {
  try {
    const url = tutor_id
      ? `${API_URL}?tutor_id=${tutor_id}`
      : `${API_URL}`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al obtener los feedbacks");
    }

    return data;
  } catch (error) {
    console.error("Error al obtener feedbacks:", error);
    throw error;
  }
}
