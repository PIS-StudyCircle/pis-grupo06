import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResetPasswordPage from "@features/users/pages/ResetPasswordPage";
import { useUser } from "@context/UserContext";
import { useFormSubmit } from "@utils/UseFormSubmit";

// Mocks de dependencias
jest.mock("@context/UserContext");
jest.mock("@utils/UseFormSubmit");

// Mocks simples para componentes externos
jest.mock("@components/Input", () => ({
    Input: ({ id, value, onChange, placeholder, error, type }) => (
      <div>
        <input
          data-testid={id}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
        />
        {error && <span data-testid={`${id}-error`}>{error}</span>}
      </div>
    ),
  }));
  jest.mock("@components/ErrorAlert", () => ({
    ErrorAlert: ({ children }) => <div role="alert" data-testid="error-alert">{children}</div>,
  }));
  jest.mock("@components/SubmitButton", () => ({
    SubmitButton: ({ text }) => <button type="submit">{text}</button>,
  }));

  jest.mock("../components/AuthLayout", () => ({
    AuthLayout: ({ children }) => <div>{children}</div>,
  }));

describe("ResetPasswordPage", () => {
  const mockResetPassword = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock de useUser
    useUser.mockReturnValue({ resetPassword: mockResetPassword });
  });

  // Setup con opción de simular errores del backend
  const setup = ({ token = "abc123", formError = [] } = {}) => {
    // Mock de useFormSubmit antes de renderizar
    useFormSubmit.mockReturnValue({
      handleSubmit: jest.fn((e) => e.preventDefault()),
      isSubmitting: false,
      error: formError,
      onSubmit: mockOnSubmit,
    });

    const url = `/reset_password?reset_password_token=${token}`;
    return render(
      <MemoryRouter initialEntries={[url]}>
        <ResetPasswordPage />
      </MemoryRouter>
    );
  };

  test("renderiza correctamente los campos y el botón", () => {
    setup();
  
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(screen.getByTestId("password_confirmation")).toBeInTheDocument();
    expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
  });

  test("no envía el formulario si los campos están vacíos", async () => {
    setup();

    const button = screen.getByText("Cambiar contraseña");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  test("muestra error si las contraseñas no coinciden", async () => {
    setup();
  
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByTestId("password_confirmation"), {
      target: { value: "Password456" },
    });
  
    const button = screen.getByText("Cambiar contraseña");
    fireEvent.click(button);
  
    await waitFor(() => {
      expect(screen.getAllByTestId(/-error$/).length).toBeGreaterThan(0);
    });
  });

  test("llama a resetPassword correctamente con token y contraseñas válidas", async () => {
    setup({ token: "tokenDePrueba" });
  
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByTestId("password_confirmation"), {
      target: { value: "Password123" },
    });
  
    const button = screen.getByText("Cambiar contraseña");
    fireEvent.click(button);
  
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        reset_password_token: "tokenDePrueba",
        password: "Password123",
        password_confirmation: "Password123",
      });
    });
  });

  test("muestra errores del backend si los hay", async () => {
    setup({ formError: ["Token inválido o expirado"] });

    expect(screen.getByRole("alert")).toHaveTextContent("Token inválido o expirado");
  });
});