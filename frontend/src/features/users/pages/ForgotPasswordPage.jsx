import { useState } from "react";
import { useUser } from "@context/UserContext";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "@components/Input";
import { ErrorAlert } from "@components/ErrorAlert";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import { useFormSubmit } from "@utils/UseFormSubmit";
import { useValidation } from "@hooks/useValidation";
import { validateEmail } from "@utils/validation";

const validators = {
  email: validateEmail,
};

export default function ForgotPasswordPage() {
  const { forgotPassword } = useUser();

  const { form, setField } = useFormState({ email: "" });

  const { errors, validate } = useValidation(validators);

  const { error, onSubmit } = useFormSubmit(forgotPassword, null);

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
      e.preventDefault();
      if (validate(form)) {
        setSubmitted(true);
        onSubmit(form);
      }
    };

  return (
    <AuthLayout
      title="Reestablecer tu contraseña"
      footerText="¿Recuerdas tu contraseña?"
      footerLink="/iniciar_sesion"
      footerLinkText="Iniciar sesión"
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            required
            onChange={(e) => setField("email", e.target.value)}
            error={errors.email}
          />
          
          {/* Errores del backend */}
          {error.length > 0 && (
            <ErrorAlert>
              {error.map((err, idx) => (
                <p key={idx}>{err}</p>
              ))}
            </ErrorAlert>
          )}

          <SubmitButton text="Enviar correo de recuperación" />
        </form>
      ) : (
        <div className="text-green-600 text-center">
          <div>El correo puede tardar unos minutos en llegar.</div>
          <div>Puedes cerrar esta ventana.</div>
        </div>
      )}
    </AuthLayout>
  );
}
