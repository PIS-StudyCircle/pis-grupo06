import { useEffect, useState } from "react";

export function useSessions(userId) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/v1/tutorings/upcoming?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((session) => ({
          ...session,
          date: new Date(session.date), // 🔥 clave para arreglar el error
        }));
        setSessions(normalized);
      })
      .catch((err) => {
        console.error("Error fetching sessions:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { sessions, loading, error };
}
