import { useEffect, useState } from "react";
import { getFaculties } from "../services/faculties.api";

export function useFaculties() {
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    getFaculties().then(setFaculties);
  }, []);

  return { faculties };
}
