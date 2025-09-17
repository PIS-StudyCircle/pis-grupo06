import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useFormSubmit(action, redirectTo = "/") {
  const [error, setError] = useState([]);
  const [submitted, setSubmitted] = useState(false); 
  const nav = useNavigate();

  async function onSubmit(form) {
    setError([]);
    try {
      await action(form);
      setSubmitted(true); 
      nav(redirectTo);  
    } catch (e) {
      if (Array.isArray(e?.data?.errors)) {
        setError(e.data.errors);
      } else if (e?.data?.errors && typeof e.data.errors === "object") {
        setError(Object.values(e.data.errors).flat());
      } else {
        setError([e?.data?.status?.message || "Ocurrió un error"]);
      }
    }
  }

  return { error, onSubmit, submitted }; 
}