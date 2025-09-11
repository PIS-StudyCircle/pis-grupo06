import { useMemo } from "react";

function normalize(str) {
  return str
    .normalize("NFD")               // separa letras de los acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina los acentos
    .toLowerCase();                  // pasa todo a minúsculas
}

export function useFilteredCourses(courses, search) {
  return useMemo(() => {
    if (!search) return courses;
    const q = normalize(search);
    return courses.filter((c) => normalize(c.name).includes(q));
  }, [search, courses]);
}
