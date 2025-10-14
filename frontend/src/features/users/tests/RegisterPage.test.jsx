/* global global */
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
jest.mock("../components/ProfilePhotoEditor", () => ({
  ProfilePhotoEditor: ({ onApply, onCancel }) => (
    <div>
      <button onClick={() => onApply("mockUrl", new File([], "mock.png"))}>
        Aplicar
      </button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
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

  it("no envía el formulario si la validación falla", () => {
    const validateMock = jest.fn(() => false);
    const onSubmitMock = jest.fn();

    mockUseValidation.mockReturnValue({
      errors: { email: "Invalid email" },
      validate: validateMock,
    });
    mockUseFormSubmit.mockReturnValue({
      error: [],
      onSubmit: onSubmitMock,
    });

    render(<RegisterPage />);
    fireEvent.click(
      screen.getByRole("button", { name: /confirmar|registrar|sign ?up/i })
    );

    expect(validateMock).toHaveBeenCalled();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it("llama a signup correctamente cuando se envía un formulario válido", () => {
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

    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "123456" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /confirmar|registrar|sign ?up/i })
    );

    expect(validateMock).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it("muestra varios mensajes de error del backend", () => {
    mockUseFormSubmit.mockReturnValue({
      error: ["Error 1", "Error 2"],
      onSubmit: jest.fn(),
    });

    render(<RegisterPage />);
    const alert = screen.getByTestId("error-alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Error 1");
    expect(alert).toHaveTextContent("Error 2");
  });

  it("actualiza varios campos del formulario correctamente", () => {
    render(<RegisterPage />);

    const inputs = [
      { id: "name", value: "John" },
      { id: "last_name", value: "Doe" },
      { id: "email", value: "john@example.com" },
      { id: "password", value: "123456" },
      { id: "password_confirmation", value: "123456" },
      { id: "description", value: "Student" },
    ];

    inputs.forEach(({ id, value }) => {
      fireEvent.change(screen.getByTestId(id), { target: { value } });
      expect(mockSetField).toHaveBeenCalledWith(id, value);
    });
  });

  it("renderiza sin errores cuando no hay validaciones ni errores del backend", () => {
    mockUseValidation.mockReturnValue({
      errors: {},
      validate: jest.fn(() => true),
    });
    mockUseFormSubmit.mockReturnValue({
      error: [],
      onSubmit: jest.fn(),
    });

    render(<RegisterPage />);
    expect(screen.queryByTestId("error-alert")).not.toBeInTheDocument();
  });

  it("mantiene la estructura del formulario con todos los elementos", () => {
    render(<RegisterPage />);

    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();

    // verifica que haya inputs y textarea
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThanOrEqual(3);

    // verifica que haya un botón de enviar
    expect(screen.getByRole("button", { name: /confirmar/i })).toBeInTheDocument();
  });

  it("inicializa useValidation con los validadores correctos", () => {
    render(<RegisterPage />);
    expect(mockUseValidation).toHaveBeenCalledWith({
      name: expect.any(Function),
      last_name: expect.any(Function),
      email: expect.any(Function),
      password: expect.any(Function),
      password_confirmation: expect.any(Function),
    });
  });
});

describe("manejo de imagen de perfil", () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => "blob:mock");
    global.URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("muestra alerta si el archivo no es válido", () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  
    render(<RegisterPage />);
  
    // selecciona el input tipo file directamente
    const fileInput = document.querySelector('input[type="file"]');
  
    const file = new File(["(⌐□_□)"], "fake.txt", { type: "text/plain" });
  
    fireEvent.change(fileInput, { target: { files: [file] } });
  
    expect(window.alert).toHaveBeenCalledWith(
      "Solo se permiten imágenes en formato JPG o PNG."
    );
  });

  it("abre el editor si el archivo es válido", () => {
    render(<RegisterPage />);
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["(⌐□_□)"], "photo.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it("permite cancelar o aplicar los cambios del editor", () => {
    render(<RegisterPage />);
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["(⌐□_□)"], "photo.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(document.querySelector("button"));

    expect(mockSetField).toHaveBeenCalledWith("profile_photo", expect.any(File));
  });
});
