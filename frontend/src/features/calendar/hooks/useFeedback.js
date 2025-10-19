import { useEffect, useState } from "react";


export async function createFeedback(tutorId, comment) {
  try {
    const response = await fetch("/api/v1/users/user_feedbacks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // mantiene la sesión autenticada (importante con devise)
      body: JSON.stringify({
        tutor_id: tutorId,
        comment,
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

