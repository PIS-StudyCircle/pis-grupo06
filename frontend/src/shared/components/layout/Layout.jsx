// src/shared/components/layout/Layout.jsx
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

export default function Layout({ children }) {
  // Desktop: colapsado por defecto
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- Gesto de swipe (mobile) ---
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const tracking = useRef(false);

  useEffect(() => {
    const EDGE = 24;       // px desde el borde para iniciar apertura
    const TH = 48;         // umbral de distancia para confirmar swipe
    const MAX_ANGLE = 30;  // tolerancia vertical

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      touchStartX.current = t.clientX;
      touchStartY.current = t.clientY;

      // Solo empezamos a trackear apertura si tocó en el borde
      tracking.current = (!mobileOpen && t.clientX <= EDGE) || mobileOpen;
    }

    function onTouchMove(e) {
      if (!tracking.current) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartX.current;
      const dy = t.clientY - touchStartY.current;

      // Si el movimiento es muy vertical, abortamos
      if (Math.abs(dy) > Math.tan((MAX_ANGLE * Math.PI) / 180) * Math.abs(dx)) return;

      // Abrir (izq -> der) si estaba cerrado
      if (!mobileOpen && dx > TH) {
        setMobileOpen(true);
        tracking.current = false;
      }
      // Cerrar (der -> izq) si estaba abierto
      if (mobileOpen && dx < -TH) {
        setMobileOpen(false);
        tracking.current = false;
      }
    }

    function onTouchEnd() {
      tracking.current = false;
    }

    // Listeners en el documento (solo mobile)
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
      {/* 👇 Pasamos toggleSidebar para que el avatar en móvil abra el drawer */}
      <NavBar toggleSidebar={() => setMobileOpen(true)} />

      {/* Sidebar: desktop + mobile drawer + bottom bar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggleDesktop={() => setSidebarOpen(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Contenido */}
      <main
        className={`pt-16 pb-14 lg:pb-0 transition-all duration-300
                    ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}
      >
        {children}
      </main>
    </div>
  );
}
