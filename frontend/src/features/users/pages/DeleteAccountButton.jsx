import { useState } from "react";
import { useUser } from "@context/UserContext"; 
import { Input } from "@components/Input";
import { ErrorAlert } from "@components/ErrorAlert";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import { validatePassword } from "@utils/validation";
import { useValidation } from "@hooks/useValidation";
import { useFormSubmit } from "@utils/UseFormSubmit";

const validators = {
  password: validatePassword,
};

export default function DeleteAccountButton() {
  const { deleteAccount } = useUser();
  const { form, setField } = useFormState({
    password: "",
  });

  const { errors, validate } = useValidation(validators);

  const { error, onSubmit } = useFormSubmit(deleteAccount, "/");

  const [confirming, setConfirming] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(form)) {
      onSubmit(form);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4 w-full">
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="w-full bg-transparent text-red-600 font-semibold py-2 px-4 rounded-lg hover:underline hover:bg-gray-200"
        >
          Eliminar cuenta
        </button>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6 w-full">
          <div className="w-full bg-red-100 text-red-800 p-4 rounded-lg shadow-md">
            <p className="mb-3 font-medium">
              ¿Estás seguro de que querés eliminar tu cuenta? Esta acción no se puede deshacer.
            </p>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder="Confirmá tu contraseña"
              error={errors.password}
            />

            {error.length > 0 && (
              <ErrorAlert>
                {error.map((err, idx) => (
                  <p key={idx}>{err.error || err}</p>
                ))}
              </ErrorAlert>
            )}

            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <SubmitButton text="Sí, eliminar" className="w-full" />
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-md transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}