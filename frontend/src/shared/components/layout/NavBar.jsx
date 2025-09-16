// src/shared/components/layout/NavBar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../../../features/users/hooks/user_context"; // o "@/features/users/hooks/user_context"

const NavBar = ({ toggleSidebar = () => {} }) => {
  const { user, signOut } = useUser();
  const nav = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((v) => !v);

  async function handleLogout() {
    try {
      await signOut();
      setIsDropdownOpen(false);
      nav("/", { replace: true });
    } catch (e) {
      console.error("Error en logout:", e);
    }
  }

  const userInitial = (user?.name?.[0] || "?").toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#00173D] shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* ======= ESCRITORIO (>= sm) ======= */}
        <div className="hidden sm:flex items-center justify-between h-16">
          {/* Left: logo */}
          <div className="flex items-center gap-4">
            <Link to="/courses" className="flex items-center gap-2">
              <img src="/icon_sin_fondo.png" alt="Study Circle" style={{ width: 60, height: 60 }} />
              <span className="text-white font-semibold hidden sm:block">Study Circle</span>
            </Link>
          </div>

          {/* Right: auth */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 p-2 text-white rounded-lg hover:bg-[#041E49] transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">{userInitial}</span>
                  </div>
                  <span className="hidden md:block font-medium truncate max-w-[160px]">
                    {user.name || user.email}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Ver perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4 text-white">
                <Link to="/sign_in" className="px-3 hover:underline">Iniciar sesión</Link>
                <Link to="/sign_up" className="px-3 hover:underline">Registrarse</Link>
              </div>
            )}
          </div>
        </div>

        {/* ======= CELULAR (< sm) ======= */}
        {user ? (
          /* Logueado: avatar (abre sidebar) a la izquierda, logo centrado */
          <div className="sm:hidden relative h-16 flex items-center justify-center">
            {/* Avatar: ahora SOLO abre el sidebar */}
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false); // por si quedó abierto en desktop
                toggleSidebar();
              }}
              aria-label="Abrir menú"
              aria-controls="sidebar"
              className="absolute left-2 flex items-center gap-2 p-2 text-white rounded-lg hover:bg-[#041E49] transition-colors"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">{userInitial}</span>
              </div>
            </button>

            {/* Logo centrado */}
            <Link
              to="/courses"
              className="absolute left-1/2 -translate-x-1/2 flex items-center"
              aria-label="Ir a cursos"
            >
              <img src="/icon_sin_fondo.png" alt="Study Circle" style={{ width: 48, height: 48 }} />
            </Link>
          </div>
        ) : (
          /* No logueado en móvil: igual que antes */
          <div className="sm:hidden flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link to="/courses" className="flex items-center gap-2">
                <img src="/icon_sin_fondo.png" alt="Study Circle" style={{ width: 48, height: 48 }} />
              </Link>
            </div>
            <div className="flex gap-3 text-white">
              <Link to="/sign_in" className="px-2 hover:underline">Iniciar sesión</Link>
              <Link to="/sign_up" className="px-2 hover:underline">Registrarse</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
