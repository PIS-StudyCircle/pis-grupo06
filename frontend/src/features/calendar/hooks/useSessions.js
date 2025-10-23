import { useEffect, useState } from "react";

const API_BASE_URL = "/api/v1/tutorings";

export function useSessions(userId, type = "upcoming") {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // No reasignes "type" directamente
  const endpointType = type === "finalized" ? "past" : type;

  // Definí la función async correctamente
  const fetchSessions = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/${endpointType}?user_id=${userId}`);
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
  }, [userId, endpointType]);

  return { sessions, loading, error, refresh: fetchSessions };
}
