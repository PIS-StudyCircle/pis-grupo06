import { useState } from "react";
import { useUser } from "../user";
import { useNavigate } from "react-router-dom";

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
  const [err, setErr] = useState("");

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
      setErr(e?.data?.status?.message || "No se pudo crear la cuenta");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Crear cuenta</h1>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <input
        placeholder="Nombre"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        required
      />
      <input
        placeholder="Apellido"
        value={form.last_name}
        onChange={(e) => set("last_name", e.target.value)}
        required
      />
      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        required
      />
      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        required
      />
      <input
        placeholder="Confirmación"
        type="password"
        value={form.password_confirmation}
        onChange={(e) => set("password_confirmation", e.target.value)}
        required
      />
      <textarea
        placeholder="Descripción"
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
      />
      <button type="submit">Registrarme</button>
    </form>
  );
}
