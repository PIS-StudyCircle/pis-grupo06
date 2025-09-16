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
  name: (value) => validateRequired(value, "Name"),
  last_name: (value) => validateRequired(value, "Last Name"),
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
      title="Signup Your Account"
      footerText="Already have an account?"
      footerLink="/sign_in"
      footerLinkText="Sign in"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Name"
          error={errors.name} 
        />

        <Input
          id="last_name"
          type="text"
          value={form.last_name}
          onChange={(e) => setField("last_name", e.target.value)}
          placeholder="Last name"
          error={errors.last_name} 
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
          placeholder="Password"
          error={errors.password}
        />

        <Input
          id="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={(e) =>
            setField("password_confirmation", e.target.value)
          }
          placeholder="Password confirmation"
          error={errors.password_confirmation}
        />

        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Description"
        />

        {error.length > 0 && (
          <ErrorAlert>
            {error.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </ErrorAlert>
        )}

        <SubmitButton text="Sign Up" />
      </form>
    </AuthLayout>
  );
}
