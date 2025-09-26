import { useEffect, useState } from "react";
import { getTutorEvents } from "../services/calendarApi";

export function useCalendar(tutorId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTutorEvents(tutorId)
      .then(data => setEvents(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [tutorId]);

  return { events, loading };
}
