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

  const token = params.get("token");
  //const tokenTest = "abcd1234"; // Solo para pruebas locales

  const { resetPassword } = useUser();
  
    const { form, setField } = useFormState({
      token: token || "",
      password: "",
      confirm_password: "",
    });
  
    const { errors, validate } = useValidation(validators);
  
    const { error, onSubmit } = useFormSubmit(resetPassword, "/");
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (validate(form)) {
        onSubmit(form);
      }
    };

  return (
    <AuthLayout
      title="Ingrese su nueva contraseña"
      footerText="¿Recuerdas tu contraseña?"
      footerLink="/sign_in"
      footerLinkText="Iniciar sesión"
    >
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
          value={form.confirm_password}
          required
          onChange={(e) => setField("confirm_password", e.target.value)}
          error={errors.confirm_password}
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
    </AuthLayout>
  );
}