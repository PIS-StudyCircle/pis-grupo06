import { Sparkles } from "lucide-react"

export default function ImagePreview({ image, isLoading }) {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="relative border border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden min-h-[350px] w-full flex items-center justify-center">
        {isLoading ? (
          // 🌀 Animación de carga tipo CreateScreen
          <div className="flex flex-col items-center justify-center text-center p-6">
            <Sparkles className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm text-gray-600">
              Generando tu imagen... Esto puede tardar unos segundos
            </p>
          </div>
        ) : image ? (
          // 🖼 Imagen ocupa todo el contenedor
          <img
            src={image}
            alt="Avatar generado"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          // ✨ Estado vacío
          <div className="flex flex-col items-center justify-center text-center p-6">
            <Sparkles className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">Tu imagen aparecerá aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}

