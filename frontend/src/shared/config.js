export const API_BASE = "/api/v1";

export const DEFAULT_PHOTO = "/avatar.png";

export const WS_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/^http/, "ws") + "/cable"
  : "ws://localhost:3000/cable";
