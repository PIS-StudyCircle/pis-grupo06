import React from "react";
import { render, screen } from "@testing-library/react";
import SignInPage from "../pages/SignInPage";

jest.mock("../hooks/user_context", () => ({
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

describe("OAuth", () => {

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
  
  it("renderiza el botón de Google con el href correcto", () => {
    render(<SignInPage />);
    const googleButton = screen.getByText(/Iniciar sesión con Google/i);
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toHaveAttribute(
      "href",
      "http://localhost:3000/users/auth/google_oauth2"
    );
  });
});