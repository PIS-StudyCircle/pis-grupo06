import { useUser } from "@context/UserContext";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "@components/Input";
import { ErrorAlert } from "@components/ErrorAlert";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import { useFormSubmit } from "@utils/UseFormSubmit";
import { useValidation } from "@hooks/useValidation";
import { validateEmail, validatePassword } from "@utils/validation";

const validators = {
  email: validateEmail,
  password: validatePassword,
};

export default function SignInPage() {
  const { signIn } = useUser();

  const { form, setField } = useFormState({
    email: "",
    password: "",
  });

  const { errors, validate } = useValidation(validators);

  const { error, onSubmit } = useFormSubmit(signIn, "/");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(form)) {
      onSubmit(form);
    }
  };

  return (
    <AuthLayout
      title="Inicio de Sesión"
      footerText="¿No tienes una cuenta?"
      footerLink="/registrarse"
      footerLinkText="¡Regístrate!"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
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

        {/* Opciones extra: Recordar y Olvidé contraseña */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-gray-900 font-light">
              Recordar preferencias
            </label>
          </div>
          <a
            href="#"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Errores del backend */}
        {error.length > 0 && (
          <ErrorAlert>
            {error.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </ErrorAlert>
        )}

        <SubmitButton text="Ingresar" />
      </form>
    </AuthLayout>
  );
}
