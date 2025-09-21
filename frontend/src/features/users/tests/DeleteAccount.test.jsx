import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteAccountButton from "../pages/DeleteAccountButton";

jest.mock("@context/UserContext", () => ({
  useUser: () => ({
    signIn: jest.fn(),
  }),
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
    form: { password: "" },
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

describe("DeleteAccountButton", () => {
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

  function simularEliminacionCuenta(confirmation) {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByText("Eliminar cuenta"));

    // El diálogo de confirmación aparece
    expect(screen.getByText(/¿Estás seguro/)).toBeInTheDocument();

    // Simula escribir la contraseña
    fireEvent.change(screen.getByPlaceholderText("Confirmá tu contraseña"), {
      target: { value: "pepe1234" },
    });

    // Click en "Continuar"
    if (confirmation) {
      fireEvent.click(screen.getByText("Sí, eliminar"));
    } else {
      fireEvent.click(screen.getByText("Cancelar"));
    }
  }

  it("Muestra el botón y el mensaje de confirmación", () => {
    render(<DeleteAccountButton />);
    expect(screen.getByText("Eliminar cuenta")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Eliminar cuenta"));
    expect(screen.getByText(/¿Estás seguro/)).toBeInTheDocument();
    expect(screen.getByText("Sí, eliminar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("Cancela la eliminación de cuenta", () => {
    simularEliminacionCuenta(false);

    // El diálogo de confirmación desaparece y vuelve el botón principal
    expect(screen.getByText("Eliminar cuenta")).toBeInTheDocument();
    // El input y los botones de confirmación ya no están
    expect(screen.queryByPlaceholderText("Confirmá tu contraseña")).not.toBeInTheDocument();
    expect(screen.queryByText("Sí, eliminar")).not.toBeInTheDocument();
  });

  it("Ingresa contraseña incorrecta", async () => {
    mockUseFormSubmit.mockReturnValue({
      error: ["Some error"],
      onSubmit: jest.fn(),
    });

    simularEliminacionCuenta(true);
    
    expect(screen.getByTestId("error-alert")).toBeInTheDocument();
    expect(screen.getByText("Some error")).toBeInTheDocument();
  });
  
  it("Elimina la cuenta", async () => {
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

    simularEliminacionCuenta(true);
    
    expect(validateMock).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalled();
  });
});