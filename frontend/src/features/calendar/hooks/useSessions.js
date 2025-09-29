import { useState, useEffect, useCallback } from "react";
import { getSessionsByUser } from "../services/calendarApi";
import { showError } from "@utils/toastService";

export function useSessions(userId, onCountChange, type="all") {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getSessionsByUser(userId, type);
      const parsed = data
        .map((s) => ({ ...s, date: new Date(s.date) }))
        .sort((a, b) => a.date - b.date);

      setSessions(parsed);
      if (onCountChange) onCountChange(parsed.length);
    } catch (err) {
      showError("Error al cargar sesiones: " + err.message);
      setSessions([]);
      if (onCountChange) onCountChange(0);
    } finally {
      setLoading(false);
    }
  }, [userId, onCountChange]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, refresh: fetchSessions };
}
