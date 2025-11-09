import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ChevronLeft, Check, X, Undo, AlertCircle } from "lucide-react"
import PromptInput from "../components/PromptInput"
import ImagePreview from "../components/ImagePreview" // ✅ usa el nuevo componente
import { useImageEditor } from "../hooks/useImageEditor"
import { updateProfilePhoto } from "../services/UpdateProfilePhoto"

export default function AvatarEditorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const initialImage =
    location.state?.initialImage ||
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"

  const [prompt, setPrompt] = useState("")

  const {
    currentImage,
    history,
    historyIndex,
    isLoading,
    error,
    hasChanges,
    canUndo,
    editImage,
    undo,
    discard,
  } = useImageEditor(initialImage)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    try {
      await editImage(prompt)
      setPrompt("")
    } catch (err) {
      console.error("Error al editar imagen:", err)
    }
  }

  const handleBack = () => {
    if (hasChanges && !window.confirm("Tienes cambios sin guardar. ¿Salir igualmente?")) return
    navigate(-1)
  }

  const handleSaveAsProfile = async () => {
    try {
      if (!currentImage) return
      await updateProfilePhoto(currentImage)
      alert("✅ Foto de perfil actualizada correctamente")
      navigate(-1)
    } catch (err) {
      console.error(err)
      alert("❌ Error al guardar la foto de perfil")
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Atrás</span>
          </button>
          <h2 className="text-xl font-bold text-gray-900">Editar Avatar</h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white">
          {/* Panel Izquierdo */}
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <PromptInput
              prompt={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              disabled={isLoading}
              placeholder="Ej: Agregar gafas de sol, cambiar el fondo a una playa..."
            />

            {/* Historial */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Historial de Ediciones</h3>
                <span className="text-xs text-gray-500">
                  {history.length} {history.length === 1 ? "edición" : "ediciones"}
                </span>
              </div>

              <button
                onClick={undo}
                disabled={!canUndo}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Undo className="w-4 h-4" />
                Deshacer Cambio
              </button>

              {history.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {history.slice().reverse().map((entry, idx) => {
                    const actualIndex = history.length - 1 - idx
                    return (
                      <div
                        key={idx}
                        className={`text-xs p-2 rounded ${
                          historyIndex === actualIndex
                            ? "bg-blue-100 text-blue-900"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {entry.prompt}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Panel Derecho */}
          <div className="flex items-center justify-center">
            <ImagePreview image={currentImage} isLoading={isLoading} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end bg-white">
          <button
            onClick={discard}
            disabled={!hasChanges || isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Descartar Cambios
          </button>

          <button
            onClick={handleSaveAsProfile}
            disabled={!hasChanges || isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            <Check className="w-4 h-4" />
            Guardar como Foto de Perfil
          </button>
        </div>
      </div>
    </div>
  )
}
