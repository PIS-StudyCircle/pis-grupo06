/**
 * Layout de la app:
 * - Navbar fija arriba
 * - Sidebar (desktop) colapsable
 * - Drawer (mobile) que se abre/cierra con botón o gesto de swipe
 * - Contenido principal con margen dinámico según estado del sidebar
 */
import { useEffect, useRef, useState } from "react";
import Sidebar from "./SideBar";
import NavBar from "./NavBar";

export default function Layout({ children }) {
  // Estado del sidebar en escritorio: colapsado por defecto (w-16) / expandido (w-64)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estado del drawer en móvil (off-canvas)
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- Detección de gesto (swipe) en móvil ---
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const tracking = useRef(false);
  
  // Ref para evitar stale closures
  const mobileOpenRef = useRef(mobileOpen);
  
  // Mantener el ref sincronizado con el estado
  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);


  useEffect(() => {
    // Parámetros del gesto
    const EDGE = 24;       // Zona activa desde el borde izquierdo para iniciar apertura
    const TH = 48;         // Distancia mínima horizontal para confirmar el gesto
    const MAX_ANGLE = 30;  // Ángulo máximo respecto al eje X (evita activar con scroll vertical)

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      touchStartX.current = t.clientX;
      touchStartY.current = t.clientY;

      // Solo comenzamos a trackear si:
      // - Drawer cerrado y el toque comenzó en el borde izquierdo (apertura), o
      // - Drawer abierto (permite cerrar con swipe inverso)
      tracking.current = (!mobileOpen && t.clientX <= EDGE) || mobileOpen;
    }

    function onTouchMove(e) {
      if (!tracking.current) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartX.current;
      const dy = t.clientY - touchStartY.current;

      // Ignorar si el gesto es predominantemente vertical (p. ej., scroll)
      const maxTan = Math.tan((MAX_ANGLE * Math.PI) / 180);
      if (Math.abs(dy) > maxTan * Math.abs(dx)) return;

      // Abrir (swipe izquierda -> derecha) si estaba cerrado
      if (!mobileOpen && dx > TH) {
        setMobileOpen(true);
        tracking.current = false;
      }
      // Cerrar (swipe derecha -> izquierda) si estaba abierto
      if (mobileOpen && dx < -TH) {
        setMobileOpen(false);
        tracking.current = false;
      }
    }

    function onTouchEnd() {
      tracking.current = false;
    }

    // Listeners globales (solo relevantes en mobile, pero no hacemos UA sniffing)
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen">
      {/* Navbar fija. En móvil, el avatar invoca la apertura del drawer */}
      <NavBar toggleSidebar={() => setMobileOpen(true)} />

      {/* Lateral: sidebar (desktop) + drawer (mobile) */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggleDesktop={() => setSidebarOpen((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Contenedor del contenido.
          - pt-16: compensa la altura de la navbar fija
          - pb-14 en móvil: deja espacio si hubiera bottom bar (ajustable)
          - Margen izquierdo según estado del sidebar en todas las pantallas */}
      <main
        className={`pt-16 pb-14 lg:pb-0 transition-all duration-300 ${
          sidebarOpen ? "sm:ml-64" : "sm:ml-16"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
