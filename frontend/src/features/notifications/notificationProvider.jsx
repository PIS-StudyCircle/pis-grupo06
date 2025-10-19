import { createConsumer } from "@rails/actioncable";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE, WS_BASE } from "@/shared/config";
import { NotificationsCtx } from "@/shared/context/NotificationContext";

export function NotificationsProvider({ children }) {
  const [list, setList] = useState([]);
  const subRef = useRef(null);

  const unread = useMemo(() => list.filter(n => !n.read_at).length, [list]);
  const unseen = list.filter(n => !n.seen_at).length;

  async function getJson(url) {
    const r = await fetch(`${API_BASE}${url}`, { credentials: "include" });
    if (!r.ok) throw new Error(`GET ${url} failed: ${r.status}`);
    return r.json();
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getJson("/notifications");
        if (!cancelled) setList(data.notifications || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let consumer;

    (async () => {
      try {
        const tokenResp = await fetch(`${API_BASE}/notification_token`, {
          method: "POST",
          credentials: "include",
        });
        if (!tokenResp.ok) throw new Error(`POST /notification_token failed: ${tokenResp.status}`);
        const { notifToken } = await tokenResp.json();

        consumer = createConsumer(`${WS_BASE}?notif_token=${encodeURIComponent(notifToken)}`);

        subRef.current = consumer.subscriptions.create(
          { channel: "NotificationsChannel" },
          {
            received: (payload) => {
              setList(prev => (prev.some(n => n.id === payload.id) ? prev : [payload, ...prev]));
            },
          }
        );
      } catch (e) {
        console.error(e);
      }
    })();

   return () => {
      try {
        subRef.current?.unsubscribe();
        consumer?.disconnect();
      } catch (err) {
        if (import.meta?.env?.DEV) {
          console.debug("WS cleanup error:", err);
        }
      }
    };
  }, []);

  async function markRead(id) {
    await fetch(`${API_BASE}/notifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ read: true }),
    });
    setList(prev => prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
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
    setList(prev => prev.map(n => n.seen_at ? n : { ...n, seen_at: now }));
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
