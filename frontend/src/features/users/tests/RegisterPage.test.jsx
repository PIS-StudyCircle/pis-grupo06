import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterPage from "../pages/RegisterPage";

jest.mock("@context/UserContext", () => ({
  useUser: () => ({
    signup: jest.fn(),
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
jest.mock("@components/Textarea", () => ({
  Textarea: ({ id, value, onChange, placeholder }) => (
    <textarea
      data-testid={id}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
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
    form: {
      email: "",
      password: "",
      password_confirmation: "",
      name: "",
      last_name: "",
      description: "",
    },
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

describe("RegisterPage", () => {
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

  it("renders all input fields and submit button", () => {
    render(<RegisterPage />);
    expect(screen.getByTestId("name")).toBeInTheDocument();
    expect(screen.getByTestId("last_name")).toBeInTheDocument();
    expect(screen.getByTestId("email")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(screen.getByTestId("password_confirmation")).toBeInTheDocument();
    expect(screen.getByTestId("description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar|sign ?up/i })).toBeInTheDocument();
  });

  it("calls setField when typing in inputs", () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByTestId("name"), { target: { value: "John" } });
    expect(mockSetField).toHaveBeenCalledWith("name", "John");
    fireEvent.change(screen.getByTestId("email"), { target: { value: "john@example.com" } });
    expect(mockSetField).toHaveBeenCalledWith("email", "john@example.com");
  });

  it("submits the form when valid", () => {
    const validateMock = jest.fn(() => true);
    const onSubmitMock = jest.fn();

    mockUseValidation.mockReturnValue({
      errors: {},
      validate: validateMock,
    });
    mockUseFormSubmit.mockReturnValue({
      error: [],
      onSubmit: onSubmitMock,
    });

    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: /confirmar|sign ?up/i }));
    expect(validateMock).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalled();
  });

  it("shows error alert when error exists", () => {
    mockUseFormSubmit.mockReturnValue({
      error: ["Some error"],
      onSubmit: jest.fn(),
    });

    render(<RegisterPage />);
    expect(screen.getByTestId("error-alert")).toBeInTheDocument();
    expect(screen.getByText("Some error")).toBeInTheDocument();
  });

  it("shows validation errors for fields", () => {
    mockUseValidation.mockReturnValue({
      errors: { name: "Name required", email: "Invalid email" },
      validate: jest.fn(() => false),
    });

    render(<RegisterPage />);
    expect(screen.getByTestId("name-error")).toHaveTextContent("Name required");
    expect(screen.getByTestId("email-error")).toHaveTextContent("Invalid email");
  });
});
