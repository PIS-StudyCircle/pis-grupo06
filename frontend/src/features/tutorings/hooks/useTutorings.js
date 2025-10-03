import { useState, useEffect } from "react";
import { getTutorings } from "../services/tutoringService";

export const useTutorings = (initialPage = 1, perPage = 20, filters = {}, mode = "") => {
  const [tutorings, setTutorings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");

  // Si cambian los filtros o el modo, volvemos a la página 1
  useEffect(() => {
    setPage(initialPage);
  }, [filters, mode]);

  useEffect(() => {
    const fetchTutorings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTutorings(page, perPage, { ...filters, search }, mode); 
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
  }, [page, perPage, filters, search, mode]);

  return { tutorings, loading, error, pagination, page, setPage, search, setSearch };
};
