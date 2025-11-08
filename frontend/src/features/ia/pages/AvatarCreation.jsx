import { useState } from "react"
import { ChevronLeft, Check, Edit3, Sparkles } from "lucide-react"
import ImagePreview from "../components/ImagePreview"
import PromptInput from "../components/PromptInput"

export default function CreateScreen({ onBack }) {
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setShowOptions(false)
    
    // TODO: Reemplazar con tu API de generación desde cero
    // const response = await fetch('TU_API_ENDPOINT', {
    //   method: 'POST',
    //   body: JSON.stringify({ prompt })
    // })
    // const data = await response.json()
    
    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    const newImage = `https://images.unsplash.com/photo-${Math.random().toString().slice(2, 12)}?w=400&h=400&fit=crop`
    setGeneratedImage(newImage)
    setIsLoading(false)
    setShowOptions(true)
  }

  const handleSaveAsProfile = () => {
    console.log("Guardando como foto de perfil:", generatedImage)
    // TODO: Implementar lógica de guardar
    alert("¡Imagen guardada como foto de perfil!")
    onBack()
  }

  const handleEditImage = () => {
    console.log("Editando imagen:", generatedImage)
    // TODO: Navegar a EditScreen con la imagen generada
    alert("Pasando al editor... (implementar navegación)")
  }

  const handleTryAgain = () => {
    setShowOptions(false)
    setPrompt("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Crear Avatar</h2>
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
              disabled={showOptions}
              placeholder="Ej: Un astronauta realista en el espacio, iluminación cinematográfica..."
            />

            {showOptions && (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  ¿Qué deseas hacer?
                </h3>
                
                <button
                  onClick={handleSaveAsProfile}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  Guardar como Foto de Perfil
                </button>

                <button
                  onClick={handleEditImage}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Imagen
                </button>

                <button
                  onClick={handleTryAgain}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Probar Otro Prompt
                </button>
              </div>
            )}
          </div>

          {/* Panel Derecho - Preview */}
          <div>
            <ImagePreview image={generatedImage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}