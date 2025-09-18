import { useState, useEffect } from "react";
import { fetchUser } from "../services/userApi";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchUser();
        setUser(data);
      } catch (err) {
        console.error("Error al cargar usuario:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { user, loading, error };
}
