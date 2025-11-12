import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Check, Edit3, Sparkles } from "lucide-react"
import ImagePreview from "../components/ImagePreview"
import PromptInput from "../components/PromptInput"
import { generateAvatar } from "../services/avatarService";
import { updateProfilePhoto } from "../services/UpdateProfilePhoto";

export default function CreateScreen() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setShowOptions(false);

    try {
      const imageUrl = await generateAvatar(prompt);
      setGeneratedImage(imageUrl);
    } catch {
      alert("Hubo un problema generando la imagen. Intenta de nuevo en unos segundos.");
    } finally {
      setIsLoading(false);
      setShowOptions(true);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAsProfile = async () => {
    try {
      if (!generatedImage) return;
      setIsSaving(true);
      await updateProfilePhoto(generatedImage);
      alert("✅ Foto de perfil actualizada correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar la foto de perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditImage = () => {
    if (!generatedImage) return
    navigate("/avatar/editar", {
      state: { initialImage: generatedImage }
    })
  }

  const handleTryAgain = () => {
    setShowOptions(false)
    setPrompt("")
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden border border-gray-200">
        {/* Header sin botón Atrás */}
        <div className="flex items-center justify-center border-b border-gray-200 px-6 py-4 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Crear Avatar</h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white">
          {/* Panel Izquierdo */}
          <div className="space-y-6">
            <PromptInput
              prompt={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              disabled={false}
              placeholder="Ej: Un avatar realista, fondo claro, sonrisa suave..."
            />

            {showOptions && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  ¿Qué deseas hacer?
                </h3>

                <button
                  onClick={handleSaveAsProfile}
                  disabled={isLoading || isSaving}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? "Guardando..." : "Guardar como Foto de Perfil"}
                </button>

                <button
                  onClick={handleEditImage}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Imagen
                </button>

                <button
                  onClick={handleTryAgain}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Probar Otro Prompt
                </button>
              </div>
            )}
          </div>

          {/* Panel Derecho */}
          <div className="flex items-center justify-center">
            <ImagePreview image={generatedImage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}