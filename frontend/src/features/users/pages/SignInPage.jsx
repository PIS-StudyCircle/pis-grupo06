import { useUser } from "@context/UserContext";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "@components/Input";
import { ErrorAlert } from "@components/ErrorAlert";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import { useFormSubmit } from "@utils/UseFormSubmit";
import { useValidation } from "@hooks/useValidation";
import { validateEmail, validatePassword } from "@utils/validation";
import { API_BASE } from "@/shared/config";

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
          <a href="/olvide_contrasena" className="font-medium text-indigo-600 hover:text-indigo-500">
            ¿Olvidaste la contraseña?
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

        <SubmitButton text="Iniciar Sesión" />

        <a href={`${API_BASE}/users/auth/google_oauth2`}
          className="w-full flex justify-center px-4 py-2 font-semibold text-white bg-blue-500 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 mb-4">
          Iniciar sesión con Google
        </a>

      </form>
    </AuthLayout>
  );
}
