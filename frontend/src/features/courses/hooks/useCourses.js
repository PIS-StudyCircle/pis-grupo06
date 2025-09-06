import { useState, useEffect } from "react";
import { getCourses } from "../services/courseService";

export const useCourses = (initialPage = 1, perPage = 20) => {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await getCourses(page, perPage);
        setCourses(response.courses);
        setPagination(response.pagination);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [page, perPage]);

  return { courses, loading, error, pagination, page, setPage };
};
