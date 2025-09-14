import { API_BASE } from "@/shared/config";

export async function http(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    Accept: "application/json",
    ...(opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(opts.headers || {}),
  };

  let res;
  try {
    res = await fetch(url, {
      ...opts,
      headers,
      mode: "cors",
      credentials: "include",
    });
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

  if (res.status === 204) return null;

  let data = {};
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} en ${url}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
