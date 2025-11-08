import { User } from "lucide-react"
import avatar1 from "@/assets/avatar1.png"
import avatar2 from "@/assets/avatar2.png"
import avatar3 from "@/assets/avatar3.png"
import avatar4 from "@/assets/avatar4.png"
import avatar5 from "@/assets/avatar5.png"


// Mock avatar data - reemplaza con tus datos reales
const SAMPLE_AVATARS = [
  {
    id: 1,
    url: avatar1,
    name: "Avatar 1",
  },
  {
    id: 2,
    url: avatar2,
    name: "Avatar 2",
  },
  {
    id: 3,
    url: avatar3,
    name: "Avatar 3",
  },
  {
    id: 4,
    url: avatar4,
    name: "Avatar 4",
  },
  {
    id: 5,
    url: avatar5,
    name: "Avatar 5",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    name: "Avatar 6",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    name: "Avatar 7",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop",
    name: "Avatar 8",
  },
]


export default function AvatarSelector({ onSelectAvatar, onBack }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#0f3f62]">
          Selecciona un Avatar
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Info Section */}
        <div className="text-center mb-10">
          <p className="text-slate-600 max-w-2xl mx-auto mb-4">
            Elige uno de tus avatares existentes para comenzar a editarlo con inteligencia artificial
          </p>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {SAMPLE_AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onSelectAvatar(avatar.url)}
              className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 aspect-square hover:scale-105 border border-slate-200"
            >
              {/* Imagen */}
              <div className="absolute inset-0">
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay oscuro al hacer hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f3f62]/80 via-[#0f3f62]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Botón de selección */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-[#0f3f62] text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  Seleccionar
                </div>
              </div>

              {/* Nombre del avatar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-semibold text-center drop-shadow-lg">
                  {avatar.name}
                </p>
              </div>

              {/* Borde con efecto al hover */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#0f3f62] rounded-xl transition-all duration-300 pointer-events-none" />
            </button>
          ))}
        </div>

        {/* Empty state (solo se muestra si no hay avatares) */}
        {SAMPLE_AVATARS.length === 0 && (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-3">
              No hay avatares disponibles
            </h3>
            <p className="text-slate-500 mb-6">
              Crea tu primer avatar para comenzar a editar con IA
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#0f3f62] text-white rounded-lg font-semibold hover:bg-[#0a2f4a] transition-colors shadow-md"
            >
              Crear Avatar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}