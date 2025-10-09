import { useEffect, useState } from "react";
import { getUpcomingEvents } from "../services/calendarApi";

export function useSessions(userId) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return; // evita llamada si no hay usuario

    setLoading(true);
    setError(null);

    getUpcomingEvents()
      .then((data) => {
        setSessions(data);
      })
      .catch((err) => {
        console.error("Error fetching sessions:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { sessions, loading, error };
}
