import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Check, Edit3, Sparkles } from "lucide-react"
import ImagePreview from "../components/ImagePreview"
import PromptInput from "../components/PromptInput"
import { useAvatarEdit } from "../hooks/useAvatarEdit";
import { updateProfilePhoto } from "../services/UpdateProfilePhoto";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { showSuccess } from "@/shared/utils/toastService";

export default function CreateScreen() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState(null)
  const [showOptions, setShowOptions] = useState(false)
  const [error, setError] = useState(null)

  const { generateAvatar, isProcessing } = useAvatarEdit()

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setShowOptions(false);

    try {
      setError(null);
      const imageUrl = await generateAvatar(prompt);
      setGeneratedImage(imageUrl);
      setShowOptions(true);
    } catch (err) {
      setError(err.message || "Hubo un problema generando la imagen. Intenta de nuevo en unos segundos.");
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAsProfile = async () => {
    try {
      if (!generatedImage) return;
      setIsSaving(true);
      setError(null);
      await updateProfilePhoto(generatedImage);
      showSuccess("Foto de perfil actualizada correctamente");
      navigate("/perfil");
    } catch (err) {
      console.error(err);
      setError("Error al guardar la foto de perfil");
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
            {error && <ErrorAlert>{error}</ErrorAlert>}
            <PromptInput
              prompt={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              isLoading={isProcessing}
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
                  disabled={isProcessing || isSaving}
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
            <ImagePreview image={generatedImage} isLoading={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  )
}