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
  const data = await http("/users/iniciar_sesion", {
    method: "POST",
    body: JSON.stringify({ api_v1_user: { 
      email: form.email, 
      password: form.password } }),
  });
  return storeUserMaybe(data);
}

export async function signOut() {
  await http("/users/cerrar_sesion", { method: "DELETE" });
  removeItem("user");
}
