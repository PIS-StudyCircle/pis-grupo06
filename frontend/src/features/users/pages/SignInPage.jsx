import { useState } from "react";
import { useUser } from "../user";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { AuthInput } from "../components/AuthInput";
import { ErrorAlert } from "../components/ErrorAlert";
import { SubmitButton } from "../components/SubmitButton";


export default function SignInPage() {
  const { signIn } = useUser();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await signIn(email, password);
      nav("/");
    } catch (e) {
      setErr(e?.data?.status?.message || "Usuario y/o contraseña inválidos");
    }
  }

  return (
    <AuthLayout
       title ='Sign in Your Account'
       footerText ="Don't have an account?"
       footerLink = '/sign_up'
       footerLinkText = 'Sign up' 
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <AuthInput
          id = 'email'
          label = 'Email'
          type = 'email'
          value = {email}
          onChange = {(e) => setEmail(e.target.value)}
        />

        <AuthInput
          id = 'password'
          label = 'Password'
          type = 'password'
          value = {password}
          required
          onChange = {(e) => setPassword(e.target.value)}
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
          {err}
        </ErrorAlert>

        <SubmitButton text='Sign In'/>
      </form>
    </AuthLayout>
  );
}
