import { useState, useEffect, useRef } from "react";
import useChat from "../hooks/useChat";
import { useUser } from "@context/UserContext";

export default function ChatModal({ chatId, token, onClose }) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const { messages, send, ready } = useChat({ chatId, token });
  const modalRef = useRef(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cerrar modal al hacer click fuera
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md rounded-xl shadow-lg flex flex-col"
        style={{ height: "600px" }} // altura fija más alta
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            Cerrar
          </button>
        </div>

        {/* Mensajes */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
            {messages.map((msg) => {
                const isSelf = msg.user_id === user.id;
                return (
                <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                    isSelf ? "justify-end" : "justify-start"
                    }`}
                >
                    {!isSelf && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {msg.user_name?.charAt(0) || "?"}
                    </div>
                    )}
                    <div
                    className={`flex flex-col ${
                        isSelf ? "items-end" : "items-start"
                    } max-w-[80%]`}
                    >
                    {!isSelf && (
                        <span className="font-medium text-sm text-gray-700 mb-1">
                        {msg.user_name}
                        </span>
                    )}
                    <div
                        className={`p-2 rounded ${
                        isSelf ? "bg-blue-100 text-right" : "bg-gray-100 text-left"
                        }`}
                    >
                        {msg.content}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        })}
                    </span>
                    </div>
                </div>
                );
            })}
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
