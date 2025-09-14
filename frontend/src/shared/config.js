const baseFromEnv = import.meta.env.VITE_API_URL;

if (!baseFromEnv) {
  throw new Error(
    "Falta VITE_API_URL. Definí VITE_API_URL (p.ej. http://localhost:3000) en tu .env"
  );
}

export const API_BASE = `${baseFromEnv.replace(/\/+$/, "")}/api/v1`;
