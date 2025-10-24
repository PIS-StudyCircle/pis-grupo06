import {API_BASE} from "@shared/config";

const API_URL = `${API_BASE}/users/user_feedbacks`;

export async function createFeedback(tutoring_id, rating) {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
      body: JSON.stringify({
        tutoring_id,
        rating,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.errors?.join(", ") || data.error || "Error al enviar el feedback"
      );
    }

    return data;
  } catch (error) {
    console.error("Error al crear feedback:", error);
    throw error;
  }
}

export async function hasFeedback(user_id, tutoring_id) {
  try {
    const response = await fetch(
      `${API_URL}/check?user_id=${user_id}&tutoring_id=${tutoring_id}`,
      {
        method: "GET",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Error al verificar feedback");
    }

    return data; // { has_feedback: true/false, rating?: number }
  } catch (error) {
    console.error("Error al verificar feedback:", error);
    throw error;
  }
}
