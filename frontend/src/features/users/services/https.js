const baseFromEnv = import.meta.env.VITE_API_URL;

if (!baseFromEnv) {
  throw new Error(
    "Falta VITE_API_URL. Definí VITE_API_URL (p.ej. http://localhost:3000) en tu .env"
  );
}

const BASE = `${baseFromEnv.replace(/\/+$/,"")}/api/v1`;

let authToken = null;

export function setToken(t) {
  authToken = t;
  try {
    if (t) sessionStorage.setItem("token", t);
    else sessionStorage.removeItem("token");
  } catch(err) {
    console.error("Failed to set/remove token in sessionStorage:", err);
  }
}

export function getToken() {
  if (authToken) return authToken;
  try {
    const t = sessionStorage.getItem("token");
    if (t) authToken = t;
  } catch(err) {
    console.error("Failed to get token from sessionStorage:", err);
  }
  return authToken;
}

export async function http(path, { auth = false, ...opts } = {}) {
  const url = `${BASE}${path}`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  let res;
  try {
    res = await fetch(url, { ...opts, headers, mode: "cors" });
  } catch (err) {
    const hint =
      (typeof window !== "undefined" && window.location?.protocol === "https:" && String(url).startsWith("http://"))
        ? "Estás en HTTPS y el backend en HTTP (contenido mixto). Usa HTTPS en el backend o un túnel."
        : "Verificá CORS en el backend, que el host/puerto sean correctos y que el servidor esté arriba.";
    const enriched = new Error(`No se pudo conectar a ${url}. ${hint}`);
    enriched.cause = err;
    enriched.network = true;
    throw enriched;
  }

  const authHeader = res.headers.get("Authorization");
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token) setToken(token);
  }

  if (res.status === 204) return null;

  let data = {};
  try {
    data = await res.json();
  } catch {
    // ignorar, puede que no venga JSON
  }
  
  const tokenFromBody =
    data?.data?.token ||
    data?.token ||     
    null;

  if (!authHeader && tokenFromBody) {
    setToken(tokenFromBody);
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} en ${url}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
