import { http, setToken } from "./https";

function storeUserMaybe(data) {
  const userFromSignIn = data?.status?.data?.user;
  const jsonApiUser = data?.data?.attributes
    ? { id: data?.data?.id, ...data.data.attributes }
    : null;

  const user = userFromSignIn || jsonApiUser || data?.user || null;
  if (user) {
    try {
      sessionStorage.setItem("user", JSON.stringify(user));
    } catch { /* ignore */ }
  }
  return user;
}

export async function signup(form) {
  const body = {
    user: {
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation || form.password,
      name: form.name,
      last_name: form.last_name,
      description: form.description,
    },
  };
  const data = await http("/users", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const user = storeUserMaybe(data);
  return user;
}

export async function signIn({ email, password }) {
  const data = await http("/users/sign_in", {
    method: "POST",
    body: JSON.stringify({ api_v1_user: { email, password } }),
  });

  const tokenInBody = data?.status?.token;
  if (tokenInBody) setToken(tokenInBody);

  const user = storeUserMaybe(data);
  return user;
}

export async function signOut() {
  await http("/users/sign_out", { method: "DELETE", auth: true });
  try {
    sessionStorage.removeItem("user");
  } catch { /* ignore */ }
  setToken(null);
}
