import { Sparkles } from "lucide-react"

export default function PromptInput({ prompt, onChange, onSubmit, isLoading, disabled, placeholder }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-800">
        Describe tu imagen
      </label>
      <textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-400 outline-none"
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