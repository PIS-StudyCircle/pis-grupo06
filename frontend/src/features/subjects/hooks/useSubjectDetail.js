import { useState, useEffect } from "react";
import { getSubject } from "../services/subjectService";

export const useSubjectDetail = (subjectId, courseId) => {
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjectDetail = async () => {
      if (!subjectId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getSubject(subjectId, courseId);
        
        // El backend devuelve la estructura: { data: { id, name, course_id, tutorings: [...] } }
        if (response.data) {
          setSubject({
            id: response.data.id,
            name: response.data.name,
            due_date: response.data.due_date,
          });
          
        } else {
          throw new Error("Formato de respuesta inválido");
        }
      } catch (err) {
        console.error("Error al obtener el tema:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetail();
  }, [subjectId, courseId]);

  return { subject, loading, error };
};
