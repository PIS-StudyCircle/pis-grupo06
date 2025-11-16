import { Sparkles, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function AvatarModeSelector() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center p-8 pt-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-slate-900">Crear Foto de Perfil</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">Usa IA para crear tu avatar perfecto</p>
      </div>

      {/* Options Grid */}
      <div className="flex justify-center mb-12 max-w-3xl w-full">
        {/* Create Option */}
        <button
          onClick={() => navigate("/avatar/crear")}
          className="group relative overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 p-8 hover:border-purple-600 hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800"
        >
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Plus className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Crear Desde Cero</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              Genera un avatar completamente nuevo con descripción
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}