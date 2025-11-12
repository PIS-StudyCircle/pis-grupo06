import { API_BASE } from "@/shared/config"

export async function updateProfilePhoto(imageUrl) {
  try {
    // 1️⃣ Descargamos la imagen actual (que puede venir de IA o local)
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // 2️⃣ Creamos un archivo para enviar a Rails
    const file = new File([blob], "profile_photo.jpg", { type: blob.type || "image/jpeg" })

    const formData = new FormData()
    formData.append("profile_photo", file)

    // 3️⃣ Hacemos la petición al backend
    const res = await fetch(`${API_BASE}/users/upload_photo`, {
      method: "PUT",
      body: formData,
      credentials: "include", // importante si usás Devise
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.error || "Error al actualizar la foto de perfil")
    }

    return await res.json()
  } catch (err) {
    console.error("Error en updateProfilePhoto:", err)
    throw err
  }
}
