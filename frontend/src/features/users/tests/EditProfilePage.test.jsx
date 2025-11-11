import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const mockUpdateUser = jest.fn();
const mockRefetchCurrentUser = jest.fn();
const userStore = { user: null };

// Configure refetchCurrentUser to return the current user in userStore
mockRefetchCurrentUser.mockImplementation(async () => {
  return userStore.user;
});

jest.mock("@context/UserContext", () => ({
  useUser: () => ({
    user: userStore.user,
    updateUser: mockUpdateUser,
    refetchCurrentUser: mockRefetchCurrentUser,
    booting: false,
  }),
  __setUser: (u) => { userStore.user = u; },
  __resetUser: () => {
    userStore.user = null;
    mockUpdateUser.mockClear();
    mockRefetchCurrentUser.mockClear();
    mockRefetchCurrentUser.mockImplementation(async () => userStore.user);
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock("@utils/UseFormState", () => ({
  useFormState: (initial) => {
    const React = jest.requireActual("react");
    const [form, setForm] = React.useState(initial);
    React.useEffect(() => {
      setForm(initial);
    }, [JSON.stringify(initial)]);
    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return { form, setField };
  },
}));

jest.mock("@utils/UseFormSubmit", () => ({
  useFormSubmit: (action, redirectTo) => ({
    error: [],
    onSubmit: async (formData) => {
      await action(formData);
      if (redirectTo) {
        mockNavigate(redirectTo);
      }
    },
  }),
}));

let mockValidateShouldPass = true;
jest.mock("@hooks/useValidation", () => ({
  useValidation: () => ({
    errors: mockValidateShouldPass ? {} : { name: "Nombre inválido", last_name: "Apellido inválido" },
    validate: () => mockValidateShouldPass,
  }),
}));

const mockUpdateProfile = jest.fn();
jest.mock("../services/usersServices", () => ({
  updateProfile: (...args) => mockUpdateProfile(...args),
}));

jest.mock("@/shared/components/Input", () => ({
  Input: (props) => (
    <label htmlFor={props.id}>
      {props.label || props.id}
      <input
        id={props.id}
        type={props.type || "text"}
        value={props.value ?? ""}
        readOnly={props.readOnly}
        disabled={props.disabled}
        accept={props.accept}
        onChange={props.onChange}
        aria-label={props.label || props.id}
      />
      {props.error && <div role="alert">{props.error}</div>}
    </label>
  ),
}), { virtual: true });

jest.mock("@/shared/components/Textarea", () => ({
  Textarea: (props) => (
    <label htmlFor={props.id}>
      {props.label || props.id}
      <textarea
        id={props.id}
        value={props.value ?? ""}
        onChange={props.onChange}
        aria-label={props.label || props.id}
      />
    </label>
  ),
}), { virtual: true });

jest.mock("@/shared/components/SubmitButton", () => ({
  SubmitButton: ({ text }) => <button type="submit">{text || "Guardar"}</button>,
}), { virtual: true });

jest.mock("@/shared/components/ErrorAlert", () => ({
  ErrorAlert: ({ children }) => <div role="alert">{children}</div>,
}), { virtual: true });

jest.mock("@/shared/config", () => ({ DEFAULT_PHOTO: "about:default-photo" }), { virtual: true });

globalThis.URL.createObjectURL = jest.fn(() => "blob:selected-file");

jest.mock("../components/ProfilePhotoEditor", () => ({
  ProfilePhotoEditor: ({ onApply }) => (
    <div>
      <h2>Editar imagen</h2>
      <button
        type="button"
        onClick={() =>
          onApply(
            "blob:cropped-url",
            new File(["crop"], "cropped.png", { type: "image/png" })
          )
        }
      >
        Aplicar
      </button>
      <button type="button">Cancelar</button>
    </div>
  ),
}));

import EditProfilePage from "../pages/EditProfilePage";
const { __setUser, __resetUser } = jest.requireMock("@context/UserContext");

const renderWithRouter = (ui, path = "/perfil/editar") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/perfil" element={<div>Perfil</div>} />
        <Route path="/perfil/editar" element={ui} />
      </Routes>
    </MemoryRouter>
  );

describe("EditProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetUser();
    mockValidateShouldPass = true;
  });

  test("Precarga el formulario y el email está deshabilitado", async () => {
    __setUser({
      id: 77,
      email: "ana@example.com",
      name: "Ana",
      last_name: "Pérez",
      description: "Hola, soy Ana",
      profile_photo_url: "https://img/ana.png",
    });

    renderWithRouter(<EditProfilePage />);

    await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

    const email = screen.getByLabelText(/email/i);
    expect(email).toHaveValue("ana@example.com");
    expect(email).toBeDisabled();

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByAltText(/profile preview/i)).toBeInTheDocument();
  });

  test("Llama a updateProfile, actualiza los datos y navega a /perfil", async () => {
    __setUser({
      id: 77,
      email: "ana@example.com",
      name: "Ana",
      last_name: "Pérez",
      description: "",
      profile_photo_url: null,
    });

    mockUpdateProfile.mockResolvedValueOnce({
      id: 77,
      email: "ana@example.com",
      name: "Anita",
      last_name: "Pérez",
      description: "Nueva bio",
      profile_photo_url: "https://img/nueva.png",
    });

    renderWithRouter(<EditProfilePage />);

    await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Anita" } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: "Nueva bio" } });

    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    const [formArg, idArg] = mockUpdateProfile.mock.calls[0];
    expect(idArg).toBe(77);
    expect(formArg).toMatchObject({
      name: "Anita",
      last_name: "Pérez",
      description: "Nueva bio",
    });

    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/perfil"));
  });

  test("Si la validación falla no se llama updateProfile y aparece un mensaje de error", async () => {
    mockValidateShouldPass = false;

    __setUser({
      id: 1,
      email: "x@y.com",
      name: "",
      last_name: "",
      description: "",
      profile_photo_url: null,
    });

    renderWithRouter(<EditProfilePage />);

    await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });

  test("Subir imagen abre editor y al aplicar actualiza el preview", async () => {
    __setUser({
      id: 2,
      email: "b@b.com",
      name: "B",
      last_name: "BB",
      description: "",
      profile_photo_url: null,
    });

    renderWithRouter(<EditProfilePage />);

    await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

    const file = new File(["x"], "foto.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/profile_photo/i);

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText(/Editar imagen/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/aplicar/i));

    await waitFor(() =>
      expect(screen.getByAltText(/profile preview/i)).toHaveAttribute("src", "blob:cropped-url")
    );
    expect(screen.queryByText(/Editar imagen/i)).not.toBeInTheDocument();
  });

  test("Sin usuario muestra: no hay usuario cargado", async () => {
    __setUser(null);
    renderWithRouter(<EditProfilePage />);
    await screen.findByText(/no hay usuario cargado/i);
  });
});
