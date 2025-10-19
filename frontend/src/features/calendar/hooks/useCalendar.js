import { useEffect, useState } from "react";
import { getUpcomingEvents } from "../services/calendarApi";

export function useCalendar(userId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingEvents(userId)
      .then(data => setEvents(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  return { events, loading };
}
