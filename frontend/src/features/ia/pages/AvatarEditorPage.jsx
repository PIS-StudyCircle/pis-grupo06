import { useState } from "react"
import { ChevronLeft, Check, X, Undo } from "lucide-react"
import ImagePreview from "../components/ImagePreview"
import PromptInput from "../components/PromptInput"

export default function EditScreen({ onBack, initialImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" }) {
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
    
    // TODO: Reemplazar con tu API de edición
    // const response = await fetch('TU_API_ENDPOINT', {
    //   method: 'POST',
    //   body: JSON.stringify({ 
    //     image: currentImage, 
    //     prompt 
    //   })
    // })
    // const data = await response.json()
    
    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    const newImage = `https://images.unsplash.com/photo-${Math.random().toString().slice(2, 12)}?w=400&h=400&fit=crop`
    
    // Agregar al historial (elimina el futuro si estamos en medio del historial)
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
    // TODO: Implementar lógica de guardar
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Atrás</span>
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Avatar</h2>
          <div className="w-20" />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
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
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Historial de Ediciones
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {history.length} {history.length === 1 ? 'edición' : 'ediciones'}
                </span>
              </div>

              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
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
          <div>
            <ImagePreview image={currentImage} isLoading={isLoading} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={handleDiscard}
            disabled={!hasChanges}
            className="px-6 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Descartar Cambios
          </button>

          <button
            onClick={handleSaveAsProfile}
            disabled={!hasChanges}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            <Check className="w-4 h-4" />
            Guardar como Foto de Perfil
          </button>
        </div>
      </div>
    </div>
  )
}