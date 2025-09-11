import { useState } from "react";
import { useUser } from "../user";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { AuthInput } from "../components/AuthInput";
import { ErrorAlert } from "../components/ErrorAlert";
import { SubmitButton } from "../components/SubmitButton";

export default function RegisterPage() {
  const { signup } = useUser();
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
    last_name: "",
    description: "",
  });
  const [error, setErr] = useState("");

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await signup(form);
      nav("/");
    } catch (e) {
      // 1) si viene un array directo
      if (Array.isArray(e?.data?.errors)) {
        setErr(e.data.errors);
        return;
      }
      // 2) si viene hash por campo
      if (e?.data?.errors && typeof e.data.errors === "object") {
        setErr(Object.values(e.data.errors).flat());
        return;
      }
      // 3) fallback a un solo string
      setErr([e?.data?.status?.message || "Ocurrió un error"]);
    }
  }

return (
  <AuthLayout
      title ='Signup Your Account'
      footerText ="Already have an account?"
      footerLink = '/sign_in'
      footerLinkText = 'Sign in'
  >
    <form onSubmit={onSubmit} className="space-y-6">

      <AuthInput
        id = 'name'
        label = 'Name'
        type = 'text'
        required
        value = {form.name}
        onChange = {(e) => set("name",e.target.value)}
      />

      <AuthInput
        id = 'lastname'
        label = 'Lastname'
        type = 'text'
        required
        value = {form.last_name}
        onChange = {(e) => set("last_name",e.target.value)}
      />

      <AuthInput
        id = 'email'
        label = 'Email'
        type = 'email'
        required
        value = {form.email}
        onChange = {(e) => set("email",e.target.value)}
      />

      <AuthInput
        id = 'password'
        label = 'Password'
        type = 'password'
        value = {form.password}
        required
        onChange = {(e) => set("password",e.target.value)}
      />

      <AuthInput
        id = 'password_confirmation'
        label = 'Password confirmation'
        type = 'password'
        value = {form.password_confirmation}
        required
        onChange = {(e) => set("password_confirmation",e.target.value)}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id = "description"
          name = "description"
          value = {form.description}
          onChange = {(e) => set("description",e.target.value)}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <ErrorAlert>
        {error}
      </ErrorAlert>

      <SubmitButton text='Sign Up'/>
    </form>
  </AuthLayout>
  );
}
