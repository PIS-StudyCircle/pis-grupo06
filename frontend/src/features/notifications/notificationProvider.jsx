import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE, WS_BASE } from "@/shared/config";
import { NotificationsCtx } from "@/shared/context/NotificationContext";
import { getConsumer } from "@/channels/consumer";

export function NotificationsProvider({ children }) {
  const [list, setList] = useState([]);
  const subRef = useRef(null);          // guarda la suscripción
  const didInitRef = useRef(false);     // evita StrictMode double-mount

  const unread = useMemo(() => list.filter(n => !n.read_at).length, [list]);
  const unseen = useMemo(() => list.filter(n => !n.seen_at).length, [list]);

  async function getJson(url) {
    const r = await fetch(`${API_BASE}${url}`, { credentials: "include" });
    if (!r.ok) throw new Error(`GET ${url} failed: ${r.status}`);
    return r.json();
  }

  // 1) SUSCRIPCIÓN (una sola vez)
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let subscription;

    (async () => {
      try {
        // token para identificar current_user en ActionCable
        const tokenResp = await fetch(`${API_BASE}/notification_token`, {
          method: "POST",
          credentials: "include",
        });
        if (!tokenResp.ok) throw new Error(`POST /notification_token failed: ${tokenResp.status}`);
        const { notifToken } = await tokenResp.json();

        // consumer singleton
        const cable = getConsumer(`${WS_BASE}?notif_token=${encodeURIComponent(notifToken)}`);

        // crear la suscripción UNA sola vez
        subscription = cable.subscriptions.create(
          { channel: "NotificationsChannel" },
          {
            connected: () => console.log("📡 connected to NotificationsChannel"),
            disconnected: () => console.log("🔌 disconnected from NotificationsChannel"),
            received: (payload) => {
              console.log("🔔 received via AC:", payload);
              // insertar si no existe y mantener orden (created_at desc si viene)
              setList(prev => {
                if (prev.some(n => n.id === payload.id)) return prev;
                const next = [payload, ...prev];
                return next.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              });
            },
          }
        );

        subRef.current = subscription;
      } catch (e) {
        console.error("WS init error:", e);
      }
    })();

    return () => {
      try {
        subRef.current?.unsubscribe();
        subRef.current = null;
      } catch (err) {
        console.warn("⚠️ Error al desuscribir el canal:", err);
      }
      
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getJson("/notifications");
        if (cancelled) return;

        setList(prev => {
          const incoming = data.notifications || [];
          const map = new Map(prev.map(n => [n.id, n]));  // mantener las ya llegadas por WS
          for (const n of incoming) map.set(n.id, { ...map.get(n.id), ...n });
          return Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        });
      } catch (e) {
        console.error("🔔 [DEBUG] Frontend: Error cargando notificaciones:", e);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  async function markRead(id) {
    await fetch(`${API_BASE}/notifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ read: true }),
    });
    const nowIso = new Date().toISOString();
    setList(prev => prev.map(n => (n.id === id ? { ...n, read_at: nowIso } : n)));
  }

  async function markAllRead() {
    await fetch(`${API_BASE}/notifications/mark_all_read`, {
      method: "POST",
      credentials: "include",
    });
    const nowIso = new Date().toISOString();
    setList(prev => prev.map(n => (n.read_at ? n : { ...n, read_at: nowIso })));
  }

  async function markAllSeen() {
    const res = await fetch(`${API_BASE}/notifications/mark_all_seen`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("mark_all_seen failed");
    const now = new Date().toISOString();
    setList(prev => prev.map(n => (n.seen_at ? n : { ...n, seen_at: now })));
  }

  async function deleteOne(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("delete failed");
    setList(prev => prev.filter(n => n.id !== id));
  }

  async function deleteAll() {
    const res = await fetch(`${API_BASE}/notifications/destroy_all`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("delete all failed");
    setList([]);
  }

  const value = { list, unread, unseen, markRead, markAllRead, markAllSeen, deleteOne, deleteAll };
  return <NotificationsCtx.Provider value={value}>{children}</NotificationsCtx.Provider>;
}
