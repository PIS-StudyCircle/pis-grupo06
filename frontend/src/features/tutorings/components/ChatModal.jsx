import { useState, useEffect, useRef } from "react";
import useChat from "../hooks/useChat";
import { useUser } from "@context/UserContext";
import ChatModalSkeleton from "./ChatModalSkeleton";

export default function ChatModal({ chatId, token, tutoringUsers, onClose }) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const { messages, send, ready } = useChat({ chatId, token });
  const modalRef = useRef(null);
  const [userPhotos, setUserPhotos] = useState({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    send(trimmed);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  useEffect(() => {
    if (!tutoringUsers) return;

    const map = Object.fromEntries(
      tutoringUsers.map(user => [user.id, user.photo_url || ""])
    );

    setUserPhotos(map);
  }, [tutoringUsers]);

  // Mostrar skeleton mientras se cargan los mensajes / se establece la suscripción
  if (!ready && (!messages || messages.length === 0)) {
    return <ChatModalSkeleton />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md rounded-xl shadow-lg flex flex-col"
        style={{ height: "600px" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">Chat</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Mensajes */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {(() => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const isSameDay = (a, b) =>
              !!a && !!b &&
              a.getFullYear() === b.getFullYear() &&
              a.getMonth() === b.getMonth() &&
              a.getDate() === b.getDate();
            const isSameMinute = (a, b) =>
              !!a && !!b && isSameDay(a, b) &&
              a.getHours() === b.getHours() &&
              a.getMinutes() === b.getMinutes();

            return messages.map((msg, idx) => {
              const msgDate = new Date(msg.created_at);
              const prevDate = idx > 0 ? new Date(messages[idx - 1].created_at) : null;
              const nextDate = idx < messages.length - 1 ? new Date(messages[idx + 1].created_at) : null;
              const showDateHeader = !prevDate || !isSameDay(msgDate, prevDate);
              const isSelf = msg.user_id === user.id;

              let headerLabel = msgDate.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              });
              if (isSameDay(msgDate, today)) headerLabel = "Hoy";
              else if (isSameDay(msgDate, yesterday)) headerLabel = "Ayer";

              return (
                <div key={msg.id}>
                  {showDateHeader && (
                    <div className="text-xs text-gray-400 mt-1 block text-center">
                      {headerLabel}
                    </div>
                  )}

                  <div className={`flex items-start gap-2 ${isSelf ? "justify-end" : "justify-start"}`}>
                    {!isSelf && (
                      userPhotos[msg.user_id] ? (
                        <img
                          src={userPhotos[msg.user_id]}
                          alt={`${msg.user_name} ${msg.user_last_name}`.trim()}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {(
                            (msg.user_name?.charAt(0) || "") +
                            (msg.user_last_name?.charAt(0) || "")
                          )}
                        </div>
                      )
                    )}

                    <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"} max-w-[80%] min-w-0`}>
                      {!isSelf && (
                        <span className="font-medium text-sm text-gray-700 mb-1">
                          {`${msg.user_name || ""} ${msg.user_last_name || ""}`.trim()}
                        </span>
                      )}
                      <div
                        className={`p-2 rounded whitespace-pre-wrap break-words break-all ${isSelf ? "bg-blue-100 text-right" : "bg-gray-200 text-left"}`}
                        style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                      >
                        {msg.content}
                      </div>
                      {!isSameMinute(msgDate, nextDate) && (
                        <span className="text-xs text-gray-400 mt-0.1">
                          {msgDate.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
          <div ref={messagesEndRef} />
        </div>


        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Escribe un mensaje..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
