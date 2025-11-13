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

const getHeaders = (includeContentType = true) => {
  const headers = {}
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }
  
  return headers
}

const downloadImage = async (url) => {
  const response = await fetch(url)
  const blob = await response.blob()
  return blob
}

export const editImage = async (imageUrl, prompt) => {
  const imageBlob = await downloadImage(imageUrl)
  // Crear un File con el tipo correcto
  const imageFile = new File([imageBlob], "avatar.jpg", { type: imageBlob.type || "image/jpeg" })

  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('prompt', prompt)

  const response = await fetch(`${API_BASE}/avatars/edit`, {
    method: 'POST',
    headers: getHeaders(false),
    credentials: 'include',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Error editando imagen')
  }

  return response.json()
}

