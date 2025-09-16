import { useState } from "react";

export function useValidation(validators) {
  const [errors, setErrors] = useState({});

  const validate = (form) => {
    const newErrors = {};

    for (const key in validators) {
      const error = validators[key](form[key], form);
      if (error) newErrors[key] = error;
    }

    setErrors(newErrors);

    // devolver true si no hay errores
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validate };
}
