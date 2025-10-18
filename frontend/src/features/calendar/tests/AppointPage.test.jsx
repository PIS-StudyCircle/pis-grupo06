import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppointPage from "../pages/AppointPage";

const mockCreateClassEvent = jest.fn();
jest.mock("../services/calendarApi", () => ({
  createClassEvent: (...args) => mockCreateClassEvent(...args),
}));

jest.mock("@components/Input", () => ({
  Input: ({ id, name, value, onChange, label, placeholder, type = "text", error }) => (
    <label>
      {label && <span>{label}</span>}
      <input
        data-testid={id}
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
      />
      {error && <span data-testid={`${id}-error`}>{error}</span>}
    </label>
  ),
}));

jest.mock("@components/SubmitButton", () => ({
  SubmitButton: ({ text = "Crear Evento", ...props }) => (
    <button type="submit" {...props}>{text}</button>
  ),
}));

const mockSetField = jest.fn();
const defaultForm = {
  title: "",
  description: "",
  date: "",
  start_time: "",
  end_time: "",
  attendees: "",
};
const mockUseFormState = jest.fn(() => ({
  form: defaultForm,
  setField: mockSetField,
}));
jest.mock("@utils/UseFormState", () => ({
  useFormState: (...args) => mockUseFormState(...args),
}));

const mockValidate = jest.fn();
jest.mock("@hooks/useValidation", () => ({
  useValidation: () => ({
    errors: {},
    validate: (...args) => mockValidate(...args),
  }),
}));

const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
jest.mock("@utils/toastService", () => ({
  showSuccess: (...args) => mockShowSuccess(...args),
  showError: (...args) => mockShowError(...args),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const real = jest.requireActual("react-router-dom");
  return {
    ...real,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseFormState.mockReturnValue({ form: defaultForm, setField: mockSetField });
});

describe("AppointPage", () => {
  it("renderiza el formulario básico", () => {
    render(<AppointPage />);
    expect(screen.getByRole("heading", { name: /crear evento de clase/i })).toBeInTheDocument();
    expect(screen.getByTestId("title")).toBeInTheDocument();
    expect(screen.getByTestId("description")).toBeInTheDocument();
    expect(screen.getByTestId("date")).toBeInTheDocument();
    expect(screen.getByTestId("start_time")).toBeInTheDocument();
    expect(screen.getByTestId("end_time")).toBeInTheDocument();
    expect(screen.getByTestId("attendees")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear evento/i })).toBeInTheDocument();
  });

  it("bloquea el submit si la validación falla", async () => {
    mockValidate.mockReturnValue(false);
    render(<AppointPage />);

    fireEvent.click(screen.getByRole("button", { name: /crear evento/i }));
    expect(mockValidate).toHaveBeenCalledTimes(1);
    expect(mockCreateClassEvent).not.toHaveBeenCalled();
    expect(mockShowSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("envía correctamente: end corrige día si end_time <= start_time, success + navigate", async () => {
    const goodForm = {
      title: "Clase de Repaso",
      description: "Repaso general de cálculo",
      date: "2025-10-02",
      start_time: "23:30",
      end_time: "00:15",
      attendees: "ana@mail.com,  luis@mail.com",
    };

    mockUseFormState.mockReturnValue({
      form: goodForm,
      setField: mockSetField,
    });

    mockValidate.mockReturnValue(true);
    mockCreateClassEvent.mockResolvedValue({ id: "evt_123" });

    render(<AppointPage />);

    fireEvent.click(screen.getByRole("button", { name: /crear evento/i }));

    await waitFor(() => {
      expect(mockCreateClassEvent).toHaveBeenCalledTimes(1);
      expect(mockShowSuccess).toHaveBeenCalledWith("¡Evento creado exitosamente!");
      expect(mockNavigate).toHaveBeenCalledWith("/perfil");
    });

    const payload = mockCreateClassEvent.mock.calls[0][0];
    expect(payload).toMatchObject({
      title: goodForm.title,
      description: goodForm.description,
      attendees: [{ email: "ana@mail.com" }, { email: "luis@mail.com" }],
    });

    const start = new Date(payload.start);
    const end = new Date(payload.end);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });

  it("muestra error si createClassEvent rechaza", async () => {
    const goodForm = {
      title: "Evento",
      description: "Desc",
      date: "2025-10-02",
      start_time: "10:00",
      end_time: "11:00",
      attendees: "x@mail.com",
    };

    mockUseFormState.mockReturnValue({
      form: goodForm,
      setField: mockSetField,
    });

    mockValidate.mockReturnValue(true);
    mockCreateClassEvent.mockRejectedValue(new Error("Fallo API"));

    render(<AppointPage />);

    fireEvent.click(screen.getByRole("button", { name: /crear evento/i }));

    await waitFor(() => {
      expect(mockCreateClassEvent).toHaveBeenCalled();
      expect(mockShowError).toHaveBeenCalledWith(expect.stringContaining("Fallo API"));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
