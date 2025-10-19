import { API_BASE } from "@/shared/config";

const API_URL = `${API_BASE}/users/user_feedbacks`;

export async function getFeedbacks() {
  try {
    const response = await fetch(API_URL, {
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
