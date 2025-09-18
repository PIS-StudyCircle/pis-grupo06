export async function fetchUser() {
  const res = await fetch("/api/v1/users/me", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (res.status === 401) {
    // No autenticado
    return null;
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.user;
}
