import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractErrors } from "./extractErrors";

export function useFormSubmit(action, redirectTo = "/") {
  const [error, setError] = useState([]);
  const nav = useNavigate();

  async function onSubmit(form) {
    setError([]);
    try {
      await action(form);
      nav(redirectTo);
    } catch (e) {
      setError(extractErrors(e));
    }
  }

  return { error, onSubmit };
}
