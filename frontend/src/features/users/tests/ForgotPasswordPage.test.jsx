import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "@features/users/pages/ForgotPasswordPage";
import { useUser } from "@context/UserContext";

// Mock de dependencias
jest.mock("@context/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

jest.mock("@components/Input", () => ({
  Input: ({ id, label, value, onChange, error }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        data-testid={id}
        id={id}
        value={value}
        onChange={onChange}
      />
      {error && <span data-testid={`${id}-error`}>{error}</span>}
    </div>
  ),
}));

jest.mock("@components/ErrorAlert", () => ({
  ErrorAlert: ({ children }) => <div role="alert">{children}</div>,
}));

jest.mock("@components/SubmitButton", () => ({
  SubmitButton: ({ text }) => <button type="submit">{text}</button>,
}));

jest.mock("../components/AuthLayout", () => ({
    AuthLayout: ({ title, children }) => (
      <div>
        <h1>{title}</h1>
        {children}
      </div>
    ),
  }));

// Helpers
const mockForgotPassword = jest.fn();

const setup = (options = {}) => {
  useUser.mockReturnValue({
    forgotPassword: mockForgotPassword,
  });

  render(<ForgotPasswordPage />);
  return options;
};

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el formulario correctamente", () => {
    setup();

    expect(screen.getByText("Reestablecer tu contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByText("Enviar correo de recuperación")
    ).toBeInTheDocument();
  });

  it("muestra error de validación si el email es inválido", async () => {
    setup();

    const emailInput = screen.getByTestId("email");
    fireEvent.change(emailInput, { target: { value: "correo_invalido" } });

    fireEvent.submit(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByTestId("email-error")).toBeInTheDocument();
    });
  });

  it("llama a forgotPassword con el email válido", async () => {
    setup();

    const emailInput = screen.getByTestId("email");
    fireEvent.change(emailInput, { target: { value: "usuario@correo.com" } });

    fireEvent.submit(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith({ email: "usuario@correo.com" });
    });
  });

  it("muestra errores del backend si los hay", async () => {
    mockForgotPassword.mockImplementation(() =>
      Promise.reject(["Error del servidor"])
    );
    setup();

    const emailInput = screen.getByTestId("email");
    fireEvent.change(emailInput, { target: { value: "usuario@correo.com" } });

    fireEvent.submit(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Error del servidor|Ocurrió un error/i);
    });
  });

  it("muestra mensaje de confirmación tras envío exitoso", async () => {
    mockForgotPassword.mockResolvedValueOnce({});
    setup();

    const emailInput = screen.getByTestId("email");
    fireEvent.change(emailInput, { target: { value: "usuario@correo.com" } });

    fireEvent.submit(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/El correo puede tardar unos minutos en llegar/i)
      ).toBeInTheDocument();
    });
  });
});