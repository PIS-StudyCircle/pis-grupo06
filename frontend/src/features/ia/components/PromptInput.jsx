import { Sparkles } from "lucide-react"

export default function PromptInput({ prompt, onChange, onSubmit, isLoading, disabled, placeholder }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        Describe tu imagen
      </label>
      <textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        rows={4}
      />
      <button
        onClick={onSubmit}
        disabled={!prompt.trim() || isLoading || disabled}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
      >
        <Sparkles className="w-5 h-5" />
        {isLoading ? "Generando..." : "Generar Imagen"}
      </button>
    </div>
  )
}