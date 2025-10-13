import { http } from "./https";
import { saveItem, removeItem } from "@utils/storage";

function storeUserMaybe(data) {
  const user = data?.data?.user || data?.user || null;
  if (user) saveItem("user", user);
  else removeItem("user");
  return user;
}

export async function signup(form) {
  const formData = new FormData();

  formData.append("user[email]", form.email);
  formData.append("user[password]", form.password);
  formData.append("user[password_confirmation]", form.password_confirmation);
  formData.append("user[name]", form.name);
  formData.append("user[last_name]", form.last_name);
  formData.append("user[description]", form.description || "");

  if (form.profile_photo) {
    formData.append("user[profile_photo]", form.profile_photo); 
  }

  const data = await http("/users", {
    method: "POST",
    body: formData, 
  });

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

export async function forgotPassword(form) {
  const body = {
    user: {
      email: form.email,
    },
  };
  return await http("/users/password", { method: "POST", body: JSON.stringify(body) });
}

export async function resetPassword(form) {
  const body = {
    user: {
      reset_password_token: form.reset_password_token,
      password: form.password,
      password_confirmation: form.password_confirmation,
    },
  };
  return await http("/users/password", { method: "PUT", body: JSON.stringify(body) });
}