import { useState } from "react";
import { useUser } from "../user";
import { useNavigate } from "react-router-dom";

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
      setErr(e?.data?.status?.message || "Error al iniciar sesión");
    }
  }

  return (
    <div>
      <h1>Iniciar sesiónnnn</h1>
      <form onSubmit={onSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button>Entrar</button>
      </form>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
}
