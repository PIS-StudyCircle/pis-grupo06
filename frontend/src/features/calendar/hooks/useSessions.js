import { useEffect, useState } from "react";

export function useSessions(userId) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/tutorings/upcoming?user_id=${userId}`);
      const data = await res.json();
      const normalized = data.map((session) => ({
        ...session,
        date: new Date(session.date),
      }));
      setSessions(normalized);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { sessions, loading, error, refresh: fetchSessions };
}
