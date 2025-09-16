import { useState, useEffect } from "react";
import { getTutorings } from "../services/tutoringService";

export const useTutorings = (initialPage = 1, perPage = 20) => {
  const [tutorings, setTutorings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTutorings = async () => {
      setLoading(true);
      try {
        const response = await getTutorings(page, perPage, search); 
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
  }, [page, perPage, search]);

  return { tutorings, loading, error, pagination, page, setPage, search, setSearch };
};
