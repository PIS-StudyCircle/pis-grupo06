import { useUser } from "../hooks/user_context";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "../../../shared/components/Input";
import { ErrorAlert } from "../../../shared/components/ErrorAlert";
import { SubmitButton } from "../../../shared/components/SubmitButton";
import { useFormState } from "../../../shared/utils/UseFormState";
import { useFormSubmit } from "../../../shared/utils/UseFormSubmit";

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
  const { error, onSubmit } = useFormSubmit(signup, "/");

return (
  <AuthLayout
      title ='Signup Your Account'
      footerText ="Already have an account?"
      footerLink = '/sign_in'
      footerLinkText = 'Sign in'
  >
    <form onSubmit={(e) => onSubmit(e,form)} className="space-y-6">

      <Input
        id = 'name'
        label = 'Name'
        type = 'text'
        required
        value = {form.name}
        onChange = {(e) => setField("name",e.target.value)}
      />

      <Input
        id = 'lastname'
        label = 'Lastname'
        type = 'text'
        required
        value = {form.last_name}
        onChange = {(e) => setField("last_name",e.target.value)}
      />

      <Input
        id = 'email'
        label = 'Email'
        type = 'email'
        required
        value = {form.email}
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

      <Input
        id = 'password_confirmation'
        label = 'Password confirmation'
        type = 'password'
        value = {form.password_confirmation}
        required
        onChange = {(e) => setField("password_confirmation",e.target.value)}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id = "description"
          name = "description"
          value = {form.description}
          onChange = {(e) => setField("description",e.target.value)}
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
