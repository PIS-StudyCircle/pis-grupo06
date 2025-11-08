import { ImageIcon } from "lucide-react"

export default function ImagePreview({ image, isLoading }) {
  return (
    <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden shadow-inner">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Generando imagen...</p>
          </div>
        </div>
      ) : image ? (
        <img src={image} alt="Avatar generado" className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Tu imagen aparecerá aquí</p>
          </div>
        </div>
      )}
    </div>
  )
}