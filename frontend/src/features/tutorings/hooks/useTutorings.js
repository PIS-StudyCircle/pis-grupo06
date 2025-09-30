import { useState, useEffect } from "react";
import { getTutorings } from "../services/tutoringService";

export const useTutorings = (initialPage = 1, perPage = 20, filters = {}) => {
  const [tutorings, setTutorings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const fetchTutorings = async () => {
      setLoading(true);
      try {
        const response = await getTutorings(page, perPage, filters); 
        setTutorings(response.tutorings);
        setPagination(response.pagination);
      } catch (err) {
        console.error("Error fetching tutorings:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorings();
  }, [page, perPage, filters]); 

  return { tutorings, loading, error, pagination, page, setPage };
};
