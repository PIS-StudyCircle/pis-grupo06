// src/shared/components/layout/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../../features/users/hooks/user_context";
import { Home, BookOpen, Users, GraduationCap, Menu, User as UserIcon, LogOut } from "lucide-react";

const Sidebar = ({
  isOpen,              // desktop: expandido/colapsado (w-64 / w-16)
  onToggleDesktop,     // desktop: toggle con el botón de 3 rayas
  mobileOpen,          // mobile: drawer abierto/cerrado
  onMobileClose,       // mobile: cerrar drawer
}) => {
  const { user, signOut } = useUser();
  const location = useLocation();
  const nav = useNavigate();

  const authedItems = [
    { title: "Home",     path: "/",         Icon: Home },
    { title: "Clases",   path: "/classes",  Icon: BookOpen },
    { title: "Tutorías", path: "/tutoring", Icon: Users },
    { title: "Materias", path: "/subjects", Icon: GraduationCap },
  ];
  const guestItems = [
    { title: "Home",     path: "/",         Icon: Home },
    { title: "Materias", path: "/subjects", Icon: GraduationCap },
  ];
  const menuItems = user ? authedItems : guestItems;

  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + "/");
  const widthCls = isOpen ? "w-64" : "w-64 lg:w-16";

  async function handleLogout() {
    try {
      await signOut();
      onMobileClose?.();
      nav("/", { replace: true });
    } catch (e) {
      console.error("Error en logout:", e);
    }
  }

  return (
    <>
      {/* ===== Desktop sidebar (lg+) con botón de 3 rayas ===== */}
      <aside
        className={`hidden lg:block fixed left-0 z-30 bg-[#00173D] text-white border-r border-white/10 shadow-sm
                    transition-all duration-300 ease-in-out
                    top-16 h-[calc(100vh-4rem)] ${widthCls}`}
        aria-label="Sidebar"
      >
        {/* Header con botón de 3 rayas */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <button
            type="button"
            onClick={onToggleDesktop}
            className="inline-flex items-center gap-2 p-2 rounded-lg hover:bg-white/10"
            title={isOpen ? "Colapsar" : "Expandir"}
            aria-label="Alternar sidebar"
          >
            <Menu className="w-5 h-5" />
            <span className={`font-semibold ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>Menú</span>
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map(({ title, path, Icon }) => {
              const active = isActive(path);
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                                ${active ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/10"}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span
                      className={`font-medium whitespace-nowrap transition-all duration-200
                                  ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
                    >
                      {title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer usuario: solo el circulito cuando está colapsado */}
        {user && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className={`bg-white/5 rounded-lg p-2 flex items-center ${isOpen ? "gap-2" : "gap-0"}`}>
              <div className="w-8 h-8 bg:white/20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
                </span>
              </div>
              <div className={`${isOpen ? "block" : "hidden"}`}>
                <p className="text-xs text-white/70 whitespace-nowrap">Usuario</p>
                <p className="text-sm font-medium text-white truncate max-w-[160px]">
                  {user.name || user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ===== Mobile drawer (off-canvas) ===== */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition
                    ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity
                      ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onMobileClose}
        />

        {/* Panel lateral */}
        <aside
          className={`absolute top-16 left-0 h-[calc(100vh-4rem)] w-64
                      bg-[#00173D] text-white border-r border-white/10 shadow-xl
                      transform transition-transform duration-300 ease-in-out
                      ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Header con X (mobile) */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <span className="text-lg font-semibold">Menú</span>
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg hover:bg-white/10"
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* === Ver perfil (primero) === */}
          {/* Navegación */}
          <nav className="p-2 pb-20">
            <ul className="space-y-1">
              {/* Ver perfil primero */}
              {user && (
                <li>
                  <Link
                    to="/profile"
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                                ${isActive("/profile") ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/10"}`}
                  >
                    <UserIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="font-medium whitespace-nowrap">Ver perfil</span>
                  </Link>
                </li>
              )}

              {/* Resto del menú */}
              {menuItems.map(({ title, path, Icon }) => {
                const active = isActive(path);
                return (
                  <li key={path}>
                    <Link
                      to={path}
                      onClick={onMobileClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                                  ${active ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/10"}`}
                    >
                      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span className="font-medium whitespace-nowrap">{title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* === Cerrar sesión (último abajo) === */}
          {user && (
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 bg-[#00173D]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 transition-colors text-left"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">Cerrar sesión</span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
