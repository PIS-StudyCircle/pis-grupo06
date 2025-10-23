import { useEffect, useState } from "react";


export async function createFeedback(tutoring_id, rating) {
  try {
    const response = await fetch("/api/v1/users/user_feedbacks", {
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
    console.error("❌ Error al crear feedback:", error);
    throw error;
  }
}

