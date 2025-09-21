import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SignInPage from "../pages/SignInPage";

jest.mock("@context/UserContext", () => ({
  useUser: () => ({
    signIn: jest.fn(),
  }),
}));
jest.mock("../components/AuthLayout", () => ({
  AuthLayout: ({ children }) => <div>{children}</div>,
}));
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
  ErrorAlert: ({ children }) => <div data-testid="error-alert">{children}</div>,
}));
jest.mock("@components/SubmitButton", () => ({
  SubmitButton: ({ text }) => <button type="submit">{text}</button>,
}));

const mockSetField = jest.fn();
jest.mock("@utils/UseFormState", () => ({
  useFormState: () => ({
    form: { email: "", password: "" },
    setField: mockSetField,
  }),
}));

const mockUseValidation = jest.fn();
jest.mock("@hooks/useValidation", () => ({
  __esModule: true,
  useValidation: (...args) => mockUseValidation(...args),
}));

const mockUseFormSubmit = jest.fn();
jest.mock("@utils/UseFormSubmit", () => ({
  __esModule: true,
  useFormSubmit: (...args) => mockUseFormSubmit(...args),
}));

describe("SignInPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidation.mockReturnValue({
      errors: {},
      validate: jest.fn(() => true),
    });
    mockUseFormSubmit.mockReturnValue({
      error: [],
      onSubmit: jest.fn(),
    });
  });

  it("renderiza los inputs y el botón", () => {
    render(<SignInPage />);
    expect(screen.getByTestId("email")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar|sign ?in/i })).toBeInTheDocument();
  });

  it("llama a setField al tipear en los inputs", () => {
    render(<SignInPage />);
    fireEvent.change(screen.getByTestId("email"), { target: { value: "test@mail.com" } });
    expect(mockSetField).toHaveBeenCalledWith("email", "test@mail.com");
    fireEvent.change(screen.getByTestId("password"), { target: { value: "123456" } });
    expect(mockSetField).toHaveBeenCalledWith("password", "123456");
  });

  it("envía el formulario cuando es válido", () => {
    const validateMock = jest.fn(() => true);
    const onSubmitMock = jest.fn();

    mockUseValidation.mockReturnValue({ errors: {}, validate: validateMock });
    mockUseFormSubmit.mockReturnValue({ error: [], onSubmit: onSubmitMock });

    render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: /ingresar|sign ?in/i }));
    expect(validateMock).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalled();
  });

  it("muestra ErrorAlert cuando hay errores del backend", () => {
    mockUseFormSubmit.mockReturnValue({
      error: ["Credenciales inválidas"],
      onSubmit: jest.fn(),
    });

    render(<SignInPage />);
    expect(screen.getByTestId("error-alert")).toBeInTheDocument();
    expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
  });

  it("muestra errores de validación por campo", () => {
    mockUseValidation.mockReturnValue({
      errors: { email: "Email inválido", password: "Contraseña requerida" },
      validate: jest.fn(() => false),
    });

    render(<SignInPage />);
    expect(screen.getByTestId("email-error")).toHaveTextContent("Email inválido");
    expect(screen.getByTestId("password-error")).toHaveTextContent("Contraseña requerida");
  });
});
