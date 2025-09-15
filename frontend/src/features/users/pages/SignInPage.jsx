import { useUser } from "../hooks/user_context";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "../../../shared/components/Input";
import { ErrorAlert } from "../../../shared/components/ErrorAlert";
import { SubmitButton } from "../../../shared/components/SubmitButton";
import { useFormState } from "../../../shared/utils/UseFormState";
import { useFormSubmit } from "../../../shared/utils/UseFormSubmit";


export default function SignInPage() {
  
  const { signIn } = useUser();
  const { form, setField } = useFormState({
    email: "",
    password: "",
  });
  const { error, onSubmit } = useFormSubmit(signIn, "/");

  return (
    <AuthLayout
       title ='Sign in Your Account'
       footerText ="Don't have an account?"
       footerLink = '/sign_up'
       footerLinkText = 'Sign up' 
    >
      <form onSubmit={(e) => onSubmit(e,form)} className="space-y-6">
        <Input
          id = 'email'
          label = 'Email'
          type = 'email'
          value = {form.email}
          required
          onChange = {(e) => setField("email",e.target.value)}
        />

        <Input
          id = 'password'
          label = 'Password'
          type = 'password'
          value = {form.password}
          required
          onChange = {(e) => setField("password",e.target.value)}
        />

        {/* Opciones extra: Recordar y Olvidé contraseña */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <label htmlFor="remember-me" className="ml-2 block text-gray-900">
              Remember my preference
            </label>
          </div>
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot Password?
          </a>
        </div>

        <ErrorAlert>
          {error}
        </ErrorAlert>

        <SubmitButton text='Sign In'/>
      </form>
    </AuthLayout>
  );
}
