import React, { useEffect, useRef, useState } from "react";
import { Trash2, Bell as BellIcon } from "lucide-react";
import { useNotifications } from "@/shared/context/NotificationContext";

export function Bell() {
  const { list, unread, unseen, markRead, markAllRead, markAllSeen, deleteOne, deleteAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (open) {
        markAllSeen().catch(err => console.error("markAllSeen failed", err));
      }
      if (btnRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      close();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
      if ((e.key === "Enter" || e.key === " ") && document.activeElement === btnRef.current) {
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, markAllSeen]);

  async function handleItemClick(n) {
    try {
      if (!n.read_at) await markRead(n.id);
      if (n.url) window.location.assign(n.url);
    } catch (e) {
      console.error("markRead failed", e);
    }
  }

  async function handleDeleteOne(e, id) {
    e.stopPropagation();
    try {
      if (typeof deleteOne === "function") {
        await deleteOne(id);
      } else {
        console.warn("deleteOne no está disponible en el contexto");
      }
    } catch (err) {
      console.error("deleteOne failed", err);
    }
  }

  async function handleDeleteAll() {
    if (!list.length) return;
    const ok = window.confirm("¿Eliminar TODAS las notificaciones? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      if (typeof deleteAll === "function") {
        await deleteAll();
        close();
      } else {
        console.warn("deleteAll no está disponible en el contexto");
      }
    } catch (err) {
      console.error("deleteAll failed", err);
    }
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500"
        title={unread > 0 ? `${unread} notificaciones sin leer` : "Notificaciones"}
      >
      <BellIcon className="w-5 h-5 text-white" />

        {/* Punto azul en la campana si hay no vistas */}
        {unseen > 0 && (
          <span
            className="absolute top-1 right-1 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-neutral-900"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={popRef}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-96 max-w-[92vw] max-h-96 overflow-auto rounded-xl border border-white/10 bg-neutral-900 text-neutral-100 shadow-xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-white/10 bg-neutral-900/95 px-3 py-2 backdrop-blur">
            <span className="text-sm font-medium">Notificaciones</span>
            <div className="flex items-center gap-3">
              {list.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="text-xs text-red-400 underline hover:opacity-80"
                  title="Eliminar todas las notificaciones"
                >
                  Eliminar todas
                </button>
              )}
              {unread > 0 && (
                <button
                  onClick={async () => { await markAllRead(); }}
                  className="text-xs underline hover:opacity-80"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>

          {list.length === 0 ? (
            <div className="px-3 py-6 text-sm opacity-70">No hay notificaciones</div>
          ) : (
            <ul className="py-1">
              {list.map((n) => {
                const isUnread = !n.read_at;
                return (
                  <li className="flex" key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={`group flex w-full items-start justify-between gap-2 px-3 py-2 hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-none ${
                        isUnread ? "" : "opacity-70"
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        {/* Punto azul solo para no leídas (placeholder vacío para alinear leídas) */}
                        {isUnread ? (
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                        ) : (
                          <div className="mt-1 h-2 w-2 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium break-words whitespace-normal">
                            {n.title || n.kind || "Notificación"}
                          </div>
                          <div className="text-xs opacity-70">
                            {new Date(n.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </button>
                    {/* Basurita para eliminar individualmente */}
                    <button
                      aria-label="Eliminar notificación"
                      title="Eliminar"
                      className="shrink-0 p-1 rounded hover:bg-white/10 text-red-300 hover:text-red-200 px-4"
                      onClick={(e) => handleDeleteOne(e, n.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-white/10 px-3 py-2 text-right">
            <button onClick={close} className="text-xs underline hover:opacity-80">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
