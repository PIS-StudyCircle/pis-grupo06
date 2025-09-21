// src/shared/components/layout/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@context/UserContext";
import {
  Home,
  BookOpen,
  Users,
  GraduationCap,
  Menu,
  User as UserIcon,
  LogOut,
} from "lucide-react";

const Sidebar = ({
  isOpen,              // desktop: expandido/colapsado (w-64 / w-16)
  onToggleDesktop,     // desktop: toggle con el botón
  mobileOpen,          // mobile: drawer abierto/cerrado
  onMobileClose,       // mobile: cerrar drawer
}) => {
  const { user, signOut } = useUser();
  const location = useLocation();
  const nav = useNavigate();

  const authedItems = [
    { title: "Inicio", path: "/", Icon: Home },
    { title: "Clases", path: "#", Icon: BookOpen },
    { title: "Tutorías", path: "#", Icon: Users },
    { title: "Materias", path: "/materias", Icon: GraduationCap },
  ];
  const guestItems = [
    { title: "Inicio", path: "/flujo-visitante", Icon: Home },
    { title: "Materias", path: "/materias", Icon: GraduationCap },
  ];
  const menuItems = user ? authedItems : guestItems;

  // Función helper para obtener todos los items del drawer móvil
  const getMobileMenuItems = () => {
    if (!user) return menuItems;
    
    // Crear una copia y insertar "Ver perfil" después del primer elemento
    const items = [...menuItems];
    items.splice(1, 0, { 
      title: "Ver perfil", 
      path: "/perfil", 
      Icon: UserIcon,
      id: "perfil",  // ID único para este item
    });
    return items;
  };

  const isActive = (p) => 
    !!p && (location.pathname === p || location.pathname.startsWith(p + "/"));
  // Ahora el sidebar se puede expandir en todas las pantallas
  const widthCls = isOpen ? "w-64" : "w-16";

 
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
      {/* ===== Desktop sidebar (lg+) ===== */}
      <aside className={`sidebar-desktop ${widthCls}`} aria-label="Sidebar">
        {/* Header: hamburguesa + (si está abierto) X a la derecha */}
        <div className="sidebar-header">
          <button
            type="button"
            onClick={onToggleDesktop}
            className="sidebar-toggle-btn"
            aria-label={isOpen ? "Colapsar sidebar" : "Expandir sidebar"}
            aria-pressed={isOpen}
            title={isOpen ? "Colapsar" : "Expandir"}
          >
            <Menu className="w-5 h-5" />
            <span
              className={`font-semibold transition-all duration-200 ${
                isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Menú
            </span>
          </button>

          {/* Botón X se muestra cuando está abierto */}
          {isOpen && (
            <button
              onClick={onToggleDesktop}
              className="drawer-close-btn"
              aria-label="Cerrar sidebar"
              title="Cerrar sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navegación (desktop) */}
        <nav className="sidebar-nav">
          <ul className="sidebar-list">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const ItemIcon = item.Icon;
              return (
                // 3) key única y estable
                <li key={item.title}>
                  <Link
                    to={item.path}
                    className={`sidebar-link ${active ? "sidebar-link--active" : ""}`}
                  >
                    <ItemIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span
                      className={`font-medium whitespace-nowrap transition-all duration-200 ${
                        isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      }`}
                    >
                      {item.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>


      </aside>

      {/* ===== Mobile drawer ===== */}
      <div
        className={`drawer-root ${mobileOpen ? "drawer-root--open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        {/* Overlay */}
        <div
          className={`drawer-overlay ${mobileOpen ? "drawer-overlay--open" : ""}`}
          onClick={onMobileClose}
        />

        {/* Panel lateral (mobile) */}
        <aside className={`drawer-panel ${mobileOpen ? "drawer-panel--open" : ""}`}>
          {/* Header con X (mobile) */}
          <div className="drawer-header">
            <span className="text-lg font-semibold">Menú</span>
            <button
              onClick={onMobileClose}
              className="drawer-close-btn"
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Navegación (mobile) */}
          <nav className="p-2 pb-20">
            <ul className="space-y-1">
              {getMobileMenuItems().map((item) => {
                const active = isActive(item.path);
                const ItemIcon = item.Icon;
                // Usar ID único si existe, sino usar title como fallback
                const keyId = item.id || item.title;
                
                return (
                  <li key={keyId}>
                    <Link
                      to={item.path}
                      onClick={onMobileClose}
                      className={`sidebar-link ${active ? "sidebar-link--active" : ""}`}
                    >
                      <ItemIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span className="font-medium whitespace-nowrap">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Cerrar sesión (abajo) */}
          {user && (
            <div className="drawer-footer">
              <button onClick={handleLogout} className="drawer-logout-btn">
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