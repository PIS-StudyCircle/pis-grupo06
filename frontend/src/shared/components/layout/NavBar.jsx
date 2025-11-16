import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "@context/UserContext";
import { ChevronDown, LogOut, User, Edit } from "lucide-react";
import { DEFAULT_PHOTO } from "@/shared/config";
import { Bell } from "@/features/notifications/components/Bell";
import HelpMenu from "@/features/help/components/helpMenu";

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

  const photoUrl = user?.profile_photo_url || DEFAULT_PHOTO;

  return (
    <nav className="navbar">
      <div className="navbar-wrap">
        {/* ======= ESCRITORIO (>= sm) ======= */}
        <div className="navbar-desk">
          {/* Left: logo */}
          <div className="navbar-brand">
            <Link to={"/materias"} className="navbar-brand-link">
              <img
                src="/icon_sin_fondo.png"
                alt="Study Circle"
                style={{ width: 60, height: 60 }}
              />
              <span className="navbar-title">Study Circle</span>
            </Link>
          </div>

          {/* Right: auth */}
          <div className="auth-wrap">
            {user ? (
              <div className="relative flex items-center gap-3">

                <div className="relative">
                  <HelpMenu />
                </div>

                <div className="relative">
                  <Bell />
                </div>

                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="btn-avatar"
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="avatar w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-200">
                      <img
                        src={photoUrl}
                        alt={user.name || "Avatar"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="hidden md:block font-medium truncate max-w-[160px]">
                      {user.name || user.email}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="dropdown" role="menu">
                      <div className="py-1">
                        <Link
                          to="/perfil"
                          className="dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Ver perfil
                        </Link>
                        <Link
                          to="/editar-perfil"
                          className="dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Edit className="w-4 h-4 mr-3" />
                          Editar perfil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item text-left w-full"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/iniciar_sesion" className="auth-link">
                  Iniciar sesión
                </Link>
                <Link to="/registrarse" className="auth-link">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ======= CELULAR (< sm) ======= */}
        {user ? (
          <div className="navbar-mobile">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                // Asegurar que siempre se ejecute toggleSidebar
                setTimeout(() => toggleSidebar(), 0);
              }}
              aria-label="Abrir menú"
              aria-controls="sidebar"
              className="btn-avatar-mobile"
            >
              <div className="avatar w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-200">
                <img
                  src={photoUrl}
                  alt={user.name || "Avatar"}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            <Link
              to="/materias"
              className="navbar-logo-mobile"
              aria-label="Ir a cursos"
            >
              <img
                src="/icon_sin_fondo.png"
                alt="Study Circle"
                style={{ width: 48, height: 48 }}
              />
            </Link>
            
            <div className="ml-auto items-center gap-3 inline-flex">
              <HelpMenu />
              <Bell />
            </div>
          </div>
        ) : (
          <div className="navbar-mobile-guest">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleSidebar();
                }}
                aria-label="Abrir menú"
                aria-controls="sidebar"
                className="navbar-brand-link"
              >
                <img
                  src="/icon_sin_fondo.png"
                  alt="Study Circle"
                  style={{ width: 48, height: 48 }}
                />
              </button>
            </div>
            <div className="flex gap-3">
              <Link
                to="/iniciar_sesion"
                className="px-2 text-white hover:underline"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registrarse"
                className="px-2 text-white hover:underline"
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
