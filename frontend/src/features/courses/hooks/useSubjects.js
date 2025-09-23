import { useState, useEffect } from "react";
import { getSubjects } from "../services/subjectService";

export const useSubjects = (courseId, initialPage = 1, perPage = 10) => {
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const response = await getSubjects(courseId, page, perPage, search);
        setSubjects(response.subjects);
        setPagination(response.pagination || {});
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [courseId, page, perPage, search]);

  return { subjects, loading, error, pagination, page, setPage, search, setSearch };
};
