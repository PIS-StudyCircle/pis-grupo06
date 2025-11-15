import { API_BASE } from "@/shared/config";

export async function generateAvatar(prompt) {
  try {
    const response = await fetch(`${API_BASE}/avatars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // importante para enviar cookies Devise
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Error al generar la imagen");
    }

    const data = await response.json();
    return data.image_url;
  } catch (err) {
    console.error("Error en avatarService.generateAvatar:", err);
    throw err;
  }
}

