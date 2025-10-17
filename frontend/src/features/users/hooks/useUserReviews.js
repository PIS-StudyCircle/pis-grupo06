import { useEffect, useState } from "react";
import { getReviewsByUser } from "../services/usersServices";

export function useUserReviews(userId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    async function loadReviews() {
      setLoading(true);
      try {
        const data = await getReviewsByUser(userId);
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [userId]);

  return { reviews, loading, error, setReviews };
}
