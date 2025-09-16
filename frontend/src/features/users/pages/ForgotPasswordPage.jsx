import { useUser } from "../hooks/user_context";
import { AuthLayout } from "../components/AuthLayout";
import { Input } from "../../../shared/components/Input";
import { ErrorAlert } from "../../../shared/components/ErrorAlert";
import { SubmitButton } from "../../../shared/components/SubmitButton";
import { useFormState } from "../../../shared/utils/UseFormState";
import { useFormSubmit } from "../../../shared/utils/UseFormSubmit";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useUser();
  const { form, setField } = useFormState({
    step: 1, // 1: email, 2: code, 3: new password
    email: "",
    code: "",
    password: "",
    password_confirmation: "",
  });

  const { error: error1, onSubmit: onSubmit1 } = useFormSubmit(forgotPassword, "/"); // Send email
  const { error: error2, onSubmit: onSubmit2 } = useFormSubmit(forgotPassword, "/"); // Verify code
  const { error: error3, onSubmit: onSubmit3 } = useFormSubmit(forgotPassword, "/"); // Reset password

  return (
    <AuthLayout
      title="Reset Your Password"
      footerText="¿Remember your password?"
      footerLink="/sign_in"
      footerLinkText="Sign in"
    >
      {form.step === 1 && (
        <form onSubmit1={(e) => onSubmit1(e,form)} className="space-y-6">
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            required
            onChange={(e) => setField("email", e.target.value)}
          />
          
          <ErrorAlert>
            {error1}
          </ErrorAlert>
          
          <SubmitButton text="Send code" />
        </form>
      )}
      {form.step === 2 && (
        <form onSubmit2={(e) => onSubmit2(e,form)} className="space-y-6">
            <div className="text-green-600 mb-4">Email sent, it may take a few minutes to arrive.</div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter the 6-digit code:</label>
            <Input
                id="code"
                label="Code"
                type="code"
                value = {form.code}
                required
                onChange={(e) => setField("code", e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                className="w-40 px-3 py-2 text-center tracking-widest text-2xl border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 letter-spacing-2 mx-auto block"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={6}
                maxLength={6}
                placeholder="------"
                autoFocus
            />

            <ErrorAlert>
                {error2}
            </ErrorAlert>

            <SubmitButton text="Verify code" />
            
            <button
                type="button"
                onClick={
                    () => resendResetCode(form.email)
                }
                className="w-full px-4 py-2 font-semibold text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 mb-2"
                >
                Resend code
            </button>
        </form>
        )}
      {form.step === 3 && (
        <form onSubmit3={(e) => onSubmit3(e,form)} className="space-y-6">
          <Input
            id="password"
            label="Password"
            type="password"
            value={form.password}
            required
            onChange={(e) => setField("password", e.target.value)}
          />
          <Input
            id="password_confirmation"
            label="Password confirmation"
            type="password"
            value={form.password_confirmation}
            required
            onChange={(e) => setField("password_confirmation", e.target.value)}
          />
          
          <ErrorAlert>
            {error3}
          </ErrorAlert>

          <SubmitButton text="Confirm" />
        </form>
      )}
    </AuthLayout>
  );
}
