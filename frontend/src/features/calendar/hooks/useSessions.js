import { useEffect, useState } from "react";

const API_BASE_URL = "/api/v1/tutorings";

export function useSessions(userId, type="upcoming") {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (type === "finalized") {
    type = "past";
  }
  
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/${type}?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((session) => ({
          ...session,
          date: new Date(session.date),
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
