import { useState, useEffect } from "react";
import { getSubjects } from "../services/subjectService";

export const useSubjects = (courseId, initialPage = 1, perPage = 10) => {
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  const refetch = () => setReloadTick(t => t + 1);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const response = await getSubjects(courseId, page, perPage, search); 
        setSubjects(response.subjects);   
        setPagination(response.pagination);
      } catch (err) {
        console.error("Error al obtener los temas:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [page, perPage, search, reloadTick]);

  return { subjects, loading, error, pagination, page, setPage, search, setSearch, refetch };
};
