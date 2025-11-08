import { useState } from "react"
import { Check, X, Undo } from "lucide-react"
import ImagePreview from "../components/ImagePreview"
import PromptInput from "../components/PromptInput"

export default function EditScreen({
  onBack,
  initialImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
}) {
  const [prompt, setPrompt] = useState("")
  const [currentImage, setCurrentImage] = useState(initialImage)
  const [originalImage] = useState(initialImage)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newImage = `https://images.unsplash.com/photo-${Math.random()
      .toString()
      .slice(2, 12)}?w=400&h=400&fit=crop`

    const newHistory = [...history.slice(0, historyIndex + 1), { image: newImage, prompt }]
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setCurrentImage(newImage)
    setPrompt("")
    setIsLoading(false)
    setHasChanges(true)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCurrentImage(history[newIndex].image)
      setHasChanges(true)
    } else if (historyIndex === 0) {
      setHistoryIndex(-1)
      setCurrentImage(originalImage)
      setHasChanges(false)
    }
  }

  const handleSaveAsProfile = () => {
    console.log("Guardando como foto de perfil:", currentImage)
    alert("¡Imagen guardada como foto de perfil!")
    onBack()
  }

  const handleDiscard = () => {
    setCurrentImage(originalImage)
    setHistory([])
    setHistoryIndex(-1)
    setPrompt("")
    setHasChanges(false)
  }

  const canUndo = historyIndex >= 0

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden border border-gray-200">
        {/* Header sin botón Atrás */}
        <div className="flex items-center justify-center border-b border-gray-200 px-6 py-4 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Editar Avatar</h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white">
          {/* Panel Izquierdo - Controles */}
          <div className="space-y-6">
            <PromptInput
              prompt={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              disabled={false}
              placeholder="Ej: Agregar gafas de sol, cambiar el fondo a una playa..."
            />

            {/* Historial y Undo */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Historial de Ediciones
                </h3>
                <span className="text-xs text-gray-500">
                  {history.length} {history.length === 1 ? "edición" : "ediciones"}
                </span>
              </div>

              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Undo className="w-4 h-4" />
                Deshacer Cambio
              </button>

              {history.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {history
                    .slice()
                    .reverse()
                    .map((entry, idx) => {
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

          {/* Panel Derecho - Preview */}
          <div className="flex items-center justify-center">
            <ImagePreview image={currentImage} isLoading={isLoading} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end bg-white">
          <button
            onClick={handleDiscard}
            disabled={!hasChanges}
            className="px-6 py-2 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Descartar Cambios
          </button>

          <button
            onClick={handleSaveAsProfile}
            disabled={!hasChanges}
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