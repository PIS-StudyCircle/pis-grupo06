import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractErrors } from "./extractErrors";

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
      setError(extractErrors(e));
    }
  }

  return { error, onSubmit, submitted };
}

