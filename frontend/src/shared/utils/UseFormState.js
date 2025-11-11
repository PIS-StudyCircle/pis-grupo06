import { useState } from "react";

export function useFormState(init) {
  const [form, setForm] = useState(init);

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  return { form, setField, setForm };
}
