import { useEffect, useState } from "react";
import { useUser } from "@context/UserContext";
import { getTopRatedTutors } from "@/features/users/services/feedbackServices";
import TutorCard from "./TutorCard";
import TutorSkeleton from "./TutorSkeleton";

export default function TopTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getTopRatedTutors();
        setTutors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // 🔹 Si NO hay usuario logueado:
  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 mt-8 w-full max-w-md text-center">
        <h2 className="text-lg font-semibold mb-3">
          🏆 Tutores Destacados
        </h2>
        <p className="text-gray-700">
          Iniciá sesión para conocer a los tutores destacados!
        </p>
      </div>
    );
  }

  // 🔹 Si hay usuario logueado:
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mt-8 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3 text-center text-black">
        🏆 Tutores Destacados
      </h2>

      <ul className="divide-y divide-gray-200">
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <TutorSkeleton key={i} />
        ))}

        {!loading && error && (
          <li className="py-6 text-center text-red-500">{error}</li>
        )}

        {!loading && !error && tutors.length === 0 && (
          <li className="py-6 text-center text-gray-500">
            Todavía no hay tutores puntuados.
          </li>
        )}

        {!loading &&
          !error &&
          tutors.map((tutor, index) => (
            <TutorCard key={tutor.id} tutor={tutor} index={index} />
          ))}
      </ul>
    </div>
  );
}
