import { useUser } from "../hooks/user_context";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "@components/Input";
import { Textarea } from "@components/Textarea";
import { ErrorAlert } from "@components/ErrorAlert";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "@utils/validation";
import { useValidation } from "@hooks/useValidation";
import { useFormSubmit } from "@utils/UseFormSubmit";

const validators = {
  nombre: (value) => validateRequired(value, "Nombre"),
  apellido: (value) => validateRequired(value, "Apellido"),
  email: validateEmail,
  password: validatePassword,
  password_confirmation: (value, form) =>
    validatePasswordConfirmation(form.password, value),
};

export default function RegisterPage() {
  const { signup } = useUser();

  const { form, setField } = useFormState({
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
    last_name: "",
    description: "",
  });

  const { errors, validate } = useValidation(validators);
  const { error, onSubmit } = useFormSubmit(signup, "/");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(form)) {
      onSubmit(form); 
    }
  };

  return (
    <AuthLayout
      title="Registro"
      footerText="¿Ya tienes una cuenta?"
      footerLink="/sign_in"
      footerLinkText="Inicia sesión"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Input
          id="name"
          type="text"
          value={form.nombre}
          onChange={(e) => setField("nombre", e.target.value)}
          placeholder="Nombre"
          error={errors.nombre} 
        />

        <Input
          id="last_name"
          type="text"
          value={form.apellido}
          onChange={(e) => setField("apellido", e.target.value)}
          placeholder="Apellido"
          error={errors.apellido} 
        />

        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="Email"
          error={errors.email}
        />

        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          placeholder="Contraseña"
          error={errors.password}
        />

        <Input
          id="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={(e) =>
            setField("password_confirmation", e.target.value)
          }
          placeholder="Confirmación de contraseña"
          error={errors.password_confirmation}
        />

        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Descripción"
        />

        {error.length > 0 && (
          <ErrorAlert>
            {error.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </ErrorAlert>
        )}

        <SubmitButton text="Confirmar" />
      </form>
    </AuthLayout>
  );
}
