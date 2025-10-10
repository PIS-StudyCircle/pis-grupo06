import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "@context/UserContext";
import { ChevronDown, LogOut, User, Star } from "lucide-react";
import { getMyFavoriteCourses } from "../../../features/courses/services/courseService";

const NavBar = ({ toggleSidebar = () => {} }) => {
  const { user, signOut } = useUser();
  const nav = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // estado para favoritas
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [isFavOpen, setIsFavOpen] = useState(false);

  const toggleDropdown = async () => {
    setIsDropdownOpen((v) => {
      const next = !v;
      // si se va a abrir, cargamos (si aún no cargamos)
      if (next && user) {
        setIsFavOpen(false);
        fetchFavorites();
      }
      return next;
    });
  };

  async function fetchFavorites() {
    try {
      setFavError("");
      setFavLoading(true);
      const data = await getMyFavoriteCourses();
      setFavorites(data);
    } catch (e) {
      setFavError(e?.payload?.error || e?.message || "Error al cargar favoritas.");
    } finally {
      setFavLoading(false);
    }
  }

  useEffect(() => {
    function onFavChanged() {
      if (isDropdownOpen) fetchFavorites();
      else setFavorites([]);
    }
    window.addEventListener("favorites:changed", onFavChanged);
    return () => window.removeEventListener("favorites:changed", onFavChanged);
  }, [isDropdownOpen]);

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
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="btn-avatar"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="avatar">
                    <span className="avatar-letter">{userInitial}</span>
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

                      {/* Cabezera plegable */}
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-sm font-medium flex items-center justify-between hover:bg-gray-50"
                        onClick={() => setIsFavOpen((o) => !o)}
                        aria-expanded={isFavOpen}
                        aria-controls="fav-list"
                      >
                        <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                          Materias favoritas
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isFavOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      
                      {/* Contenido plegable */}
                      {isFavOpen && (
                        <div id="fav-list" className="max-h-64 overflow-y-auto border-t">
                          {favLoading && (
                            <div className="px-3 py-2 text-sm text-gray-500">Cargando…</div>
                          )}
                          {favError && (
                            <div className="px-3 py-2 text-sm text-red-600">
                              {favError}
                              <button className="ml-2 underline" onClick={fetchFavorites}>
                                Reintentar
                              </button>
                            </div>
                          )}
                          {!favLoading && !favError && favorites.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No tenés favoritas aún.
                            </div>
                          )}
                          {!favLoading && !favError && favorites.length > 0 && (
                            <ul className="py-1">
                              {favorites.map((c) => (
                                <li key={c.id}>
                                  <Link
                                    to={`/materias/${c.id}`}
                                    state={{ fromFavs: true }}
                                    className="dropdown-item"
                                    onClick={() => setIsDropdownOpen(false)}
                                    title={c.name}
                                  >
                                    <span className="truncate">{c.name}</span>
                                    {c.code && (
                                      <span className="ml-2 text-xs text-gray-500 truncate">
                                        {c.code}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      <Link
                        to="/perfil"
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Ver perfil
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
              <div className="avatar">
                <span className="avatar-letter">{userInitial}</span>
              </div>
            </button>

            <Link to="/materias" className="navbar-logo-mobile" aria-label="Ir a cursos">
              <img
                src="/icon_sin_fondo.png"
                alt="Study Circle"
                style={{ width: 48, height: 48 }}
              />
            </Link>
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
              <Link to="/iniciar_sesion" className="px-2 text-white hover:underline">
                Iniciar sesión
              </Link>
              <Link to="/registrarse" className="px-2 text-white hover:underline">
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
