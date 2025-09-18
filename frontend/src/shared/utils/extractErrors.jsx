export function extractErrors(err) {
  const data = err?.response?.data ?? err?.data ?? err;
    if (!data) return ["Ocurrió un error"];

  if (Array.isArray(data?.errors)) return data.errors.map(String);

  if (data?.errors && typeof data.errors === "object") {
    if (Array.isArray(data.errors.full_messages)) {
      return data.errors.full_messages.map(String);
    }
    return Object.values(data.errors).flat().map(String);
  }

  if (typeof data?.error === "string") return [data.error];

  if (typeof data?.message === "string") return [data.message];

  if (data?.status?.message) return [String(data.status.message)];

  return ["Ocurrió un error"];
}
