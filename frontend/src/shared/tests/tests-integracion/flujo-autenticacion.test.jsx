import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  MemoryRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import SideBar from "../../components/layout/SideBar";

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

jest.mock("../../context/UserContext", () => {
  const state = { user: null };
  const actions = {
    signIn: jest.fn(async (payload) => {
      state.user = {
        id: 55,
        name: "Bruno",
        email: payload?.email ?? "bruno@mail.com",
      };
      return state.user;
    }),
    signUp: jest.fn(async (payload) => {
      state.user = {
        id: 101,
        name: payload?.name ?? "Ana",
        email: payload?.email ?? "ana@mail.com",
      };
      return state.user;
    }),
    logout: jest.fn(() => {
      state.user = null;
    }),
  };
  return {
    useUser: () => ({ user: state.user, ...actions }),
    __setUser: (u) => {
      state.user = u;
    },
    __reset: () => {
      state.user = null;
      actions.signIn.mockClear();
      actions.signUp.mockClear();
      actions.logout.mockClear();
    },
    __actions: actions,
    __state: state,
  };
});

import {
  __setUser,
  __reset,
  __actions,
  __state,
  useUser,
} from "../../context/UserContext";

function renderWithRouter(ui, initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
  );
}

function RegisterPageMock() {
  const { signUp } = useUser();
  const navigate = useNavigate();

  const [name, setName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [description, setDescription] = React.useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    await signUp({ name, lastName, email, password, description });
    navigate("/");
  };

  return (
    <form onSubmit={onSubmit} aria-label="register-form">
      <label>
        Nombre
        <input
          aria-label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        Apellido
        <input
          aria-label="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </label>
      <label>
        Email
        <input
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Contraseña
        <input
          aria-label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label>
        Confirmar contraseña
        <input
          aria-label="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </label>
      <label>
        Descripción
        <textarea
          aria-label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button type="submit">Confirmar</button>
    </form>
  );
}

function LoginPageMock() {
  const { signIn } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    await signIn({ email, password });
    navigate("/");
  };

  return (
    <form onSubmit={onSubmit} aria-label="login-form">
      <label>
        Email
        <input
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Contraseña
        <input
          aria-label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Ingresar</button>
    </form>
  );
}

const expectMenuVisible = async (label) => {
  await waitFor(() => {
    const links = screen.queryAllByRole("link", {
      name: new RegExp(label, "i"),
    });
    expect(links.length).toBeGreaterThan(0);
  });
};

const expectMenuHidden = (label) => {
  const links = screen.queryAllByRole("link", {
    name: new RegExp(label, "i"),
  });
  expect(links.length).toBe(0);
};

describe("Flujo de Autenticación", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __reset();
  });

  test("Sin sesión la SideBar no muestra 'Usuarios', 'Mis Clases' ni 'Tutorías'", () => {
    renderWithRouter(<SideBar />);
    expectMenuHidden("Usuarios");
    expectMenuHidden("Mis Clases");
    expectMenuHidden("Tutorías");
  });

  test("Se Registra, navega y SideBar muestra 'Usuarios', 'Mis Clases' y 'Tutorías'", async () => {
    renderWithRouter(
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/auth/registro" element={<RegisterPageMock />} />
      </Routes>,
      "/auth/registro"
    );

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText(/Apellido/i), {
    target: { value: "Pérez" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "ana@mail.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar contraseña/i), {
    target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/Descripción/i), {
    target: { value: "Alumna aplicada" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Confirmar/i }));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalled());

    if (!__state.user)
      __setUser({ id: 101, name: "Ana", email: "ana@mail.com" });

    renderWithRouter(<SideBar />);
    await expectMenuVisible("Usuarios");
    await expectMenuVisible("Mis Clases");
    await expectMenuVisible("Tutorías");

    expect(__actions.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ana@mail.com",
        password: "12345678",
        name: "Ana",
      })
    );
  });

  test("Al iniciar sesión se muestra en la SideBar: 'Usuarios', 'Mis Clases' y 'Tutorías'", async () => {
    renderWithRouter(
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/auth/login" element={<LoginPageMock />} />
      </Routes>,
      "/auth/login"
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "bruno@mail.com" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "secreto123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Ingresar/i }));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalled());
    if (!__state.user)
      __setUser({ id: 55, name: "Bruno", email: "bruno@mail.com" });

    renderWithRouter(<SideBar />);
    await expectMenuVisible("Usuarios");
    await expectMenuVisible("Mis Clases");
    await expectMenuVisible("Tutorías");

    expect(__actions.signIn).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "bruno@mail.com",
        password: "secreto123",
      })
    );
  });

  test("Logout: vuelve a ocultar 'Usuarios', 'Mis Clases' y 'Tutorías'", () => {
    __setUser({ id: 1, name: "Logueado", email: "user@mail.com" });

    const { rerender } = renderWithRouter(<SideBar />);
    expect(
      screen.queryAllByRole("link", { name: /Usuarios/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.queryAllByRole("link", { name: /Mis Clases/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.queryAllByRole("link", { name: /Tutorías/i }).length
    ).toBeGreaterThan(0);

    __actions.logout();
    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <SideBar />
      </MemoryRouter>
    );

    expectMenuHidden("Usuarios");
    expectMenuHidden("Mis Clases");
    expectMenuHidden("Tutorías");
  });
});
