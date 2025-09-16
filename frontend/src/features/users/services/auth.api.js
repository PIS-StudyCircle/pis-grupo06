import { http } from "./https";
import { saveItem, removeItem } from "@utils/storage";

function storeUserMaybe(data) {
  const user = data?.data?.user || data?.user || null;
  if (user) saveItem("user", user);
  else removeItem("user");
  return user;
}

export async function signup(form) {
  const body = {
    user: {
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
      name: form.name,
      last_name: form.last_name,
      description: form.description,
    },
  };
  const data = await http("/users", { method: "POST", body: JSON.stringify(body) });
  return storeUserMaybe(data);
}

export async function signIn(form) {
  const data = await http("/users/sign_in", {
    method: "POST",
    body: JSON.stringify({ api_v1_user: { 
      email: form.email, 
      password: form.password } }),
  });
  return storeUserMaybe(data);
}

export async function signOut() {
  await http("/users/sign_out", { method: "DELETE" });
  removeItem("user");
}

// Servicios para el flujo de Forgot Password

export async function sendForgotPasswordEmail(form) {
  const res = await fetch("/api/v1/password/forgot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function verifyResetCode(form) {
  const res = await fetch("/api/v1/password/verify_code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.email, code: form.code })
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function resetPassword(form) {
  const res = await fetch("/api/v1/password/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.email, code: form.code, password: form.password, password_confirmation: form.password_confirmation })
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function resendResetCode(form) {
  const res = await fetch("/api/v1/password/resend_code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.email })
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
