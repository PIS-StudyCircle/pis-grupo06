import { useState } from "react"
import { Check, Edit3, Sparkles } from "lucide-react"
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

    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const newImage = `https://images.unsplash.com/photo-${Math.random()
      .toString()
      .slice(2, 12)}?w=400&h=400&fit=crop`

    setGeneratedImage(newImage)
    setIsLoading(false)
    setShowOptions(true)
  }

  const handleSaveAsProfile = () => {
    console.log("Guardando como foto de perfil:", generatedImage)
    alert("¡Imagen guardada como foto de perfil!")
    onBack()
  }

  const handleEditImage = () => {
    console.log("Editando imagen:", generatedImage)
    alert("Pasando al editor... (implementar navegación)")
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
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Guardar como Foto de Perfil
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
            <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50 text-center p-6 min-h-[350px] w-full">
              {isLoading ? (
                <>
                  <Sparkles className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                  <p className="text-sm text-gray-600">Generando tu imagen...</p>
                </>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Avatar generado"
                  className="rounded-full w-48 h-48 object-cover shadow-md"
                />
              ) : (
                <>
                  <Sparkles className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500">Tu imagen aparecerá aquí</p>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end bg-white">
          <button
            onClick={handleSaveAsProfile}
            disabled={!generatedImage}
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