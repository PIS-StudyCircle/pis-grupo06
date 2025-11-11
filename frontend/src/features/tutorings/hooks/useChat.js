import { useEffect, useRef, useState } from "react";
import { createConsumer } from "@rails/actioncable";
import { WS_BASE, API_BASE } from "@/shared/config";

export default function useChat({ chatId }) {
  const [messages, setMessages] = useState([]);
  const subscriptionRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log('en useChat effect');
    if (!chatId) return;

    let cancelled = false;
    let consumer;

    (async () => {
      try {
        // Traer mensajes iniciales
        const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
          credentials: "include", 
        });
        const data = await res.json();
        if (!cancelled) setMessages(data);

        // Obtener token temporal para WebSocket
        const tokenResp = await fetch(`${API_BASE}/notification_token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId }),
          credentials: "include",
        });
        if (!tokenResp.ok) throw new Error("No se pudo obtener token WS");
        const { notifToken } = await tokenResp.json();

        // Crear consumer y suscripción
        consumer = createConsumer(`${WS_BASE}?notif_token=${encodeURIComponent(notifToken)}`);
        subscriptionRef.current = consumer.subscriptions.create(
          { channel: "ChatChannel", chat_id: chatId },
          {
            connected() {
              console.log("WebSocket conectado al chat", chatId);
              setReady(true);
            },
            disconnected() {
              console.log("WebSocket desconectado");
              setReady(false);
            },
            received(payload) {
               setMessages(prev => {
                if (prev.some(msg => msg.id === payload.id)) return prev;
                return [...prev, payload];
              });
            },
          }
        );
      } catch (err) {
        console.error("Error en useChat:", err);
      }
    })();

    return () => {
      cancelled = true;
      try {
        subscriptionRef.current?.unsubscribe();
        consumer?.disconnect();
      } catch (err) {
        console.debug("Error al limpiar WS:", err);
      }
    };
  }, [chatId]);

  const send = (content) => {
    if (!content.trim()) return;
    if (!subscriptionRef.current) {
      console.warn("No hay suscripción activa para enviar mensaje");
      return;
    }
    console.log("Enviando mensaje:", content);
    subscriptionRef.current.perform("send_message", { content });
  };

  return { messages, send, ready };
}
