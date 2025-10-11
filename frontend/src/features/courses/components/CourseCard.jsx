import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { favoriteCourse, unfavoriteCourse } from "../services/courseService";

export default function CourseCard({ course }) {

  const [favorite, setFavorite] = useState(
    typeof course?.favorite === "boolean" ? course.favorite : null
  );

  async function toggleFavorite() {
    if (!course) return;
    try {
      if (favorite) {
        await unfavoriteCourse(course.id);
        setFavorite(false);
      } else {
        await favoriteCourse(course.id);
        setFavorite(true);
      }
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
    }
  }

  return (
    <div className="w-full bg-white rounded-lg shadow p-4 my-4 flex items-center justify-between gap-2">
      <div className="items-start flex flex-col">
        <div className="flex items-center gap-2">
          <Link to={`/materias/${course.id}`} className="block">
            <h2 className="text-black font-semibold text-lg hover:underline">
              {course.name}
            </h2>
          </Link>

          {favorite !== null && (
            <button
              type="button"
              onClick={toggleFavorite}
              aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              title={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
            >
              <svg
                className={`w-5 h-5 ${favorite ? "text-yellow-400" : "text-gray-300"}`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 22 20"
                fill="currentColor"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
            </button>
          )}
        </div>

        {course.code && (
          <p className="text-gray-700 text-sm">
            <strong>Código:</strong> {course.code}
          </p>
        )}

        {course.institute && (
          <p className="text-gray-600 text-sm">
            <strong>Instituto:</strong> {course.institute}
          </p>
        )}
      </div>
    </div>
  );
}
