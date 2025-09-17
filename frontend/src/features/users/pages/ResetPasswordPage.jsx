import { useUser } from "../hooks/user_context";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "@components/Input";
import { ErrorAlert } from "@components/ErrorAlert";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import { useValidation } from "@hooks/useValidation";
import { useFormSubmit } from "@utils/UseFormSubmit";
import { validatePassword, validatePasswordConfirmation } from "@utils/validation";
import { useSearchParams } from "react-router-dom";

const validators = {
  password: validatePassword,
  password_confirmation: (value, form) =>
    validatePasswordConfirmation(form.password, value),
};

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("reset_password_token");
  const { resetPassword } = useUser();

  const { form, setField } = useFormState({
    reset_password_token: token || "",
    password: "",
    password_confirmation: "",
  });

  const { errors, validate } = useValidation(validators);

  const { error, onSubmit, submitted } = useFormSubmit(resetPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(form)) {
      onSubmit(form);
    }
  };

  return (
    <AuthLayout
      title="Ingresa tu nueva contraseña"
      footerText="¿Ya recordaste tu contraseña?"
      footerLink="/sign_in"
      footerLinkText="Iniciar sesión"
    >
      {submitted ? (
        <div className="text-center text-green-600 font-semibold">
          ¡Contraseña actualizada con éxito! Redirigiendo...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="password"
            label="Nueva contraseña"
            type="password"
            value={form.password}
            required
            onChange={(e) => setField("password", e.target.value)}
            error={errors.password}
          />
          <Input
            id="password_confirmation"
            label="Confirmar nueva contraseña"
            type="password"
            value={form.password_confirmation}
            required
            onChange={(e) => setField("password_confirmation", e.target.value)}
            error={errors.password_confirmation}
          />

          {error.length > 0 && (
            <ErrorAlert>
              {error.map((err, idx) => (
                <p key={idx}>{err}</p>
              ))}
            </ErrorAlert>
          )}

          <SubmitButton text="Cambiar contraseña" />
        </form>
      )}
    </AuthLayout>
  );
}
