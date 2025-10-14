import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../components/Input";

jest.mock('@/assets/eye_open.svg', () => 'EyeOpen', { virtual: true });
jest.mock('@/assets/eye_closed.svg', () => 'EyeClosed', { virtual: true });

describe("Input component", () => {
  beforeEach(() => {
    if (!window.URL.createObjectURL) {
        window.URL.createObjectURL = jest.fn();
      }
      if (!window.URL.revokeObjectURL) {
        window.URL.revokeObjectURL = jest.fn();
      }
      jest.spyOn(window.URL, "createObjectURL").mockReturnValue("blob:mock");
      jest.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renderiza input de texto correctamente", () => {
    const handleChange = jest.fn();
    render(<Input id="name" value="" onChange={handleChange} placeholder="Nombre" />);
    const input = screen.getByPlaceholderText("Nombre");
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "Juan" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("muestra y oculta contraseña al clickear el botón", () => {
    const handleChange = jest.fn();
    render(<Input id="password" type="password" value="" onChange={handleChange} placeholder="Contraseña" />);

    const input = screen.getByPlaceholderText("Contraseña");
    const button = screen.getByRole("button", { name: /show password/i });

    expect(input.type).toBe("password");
    fireEvent.click(button);
    expect(input.type).toBe("text");
    fireEvent.click(button);
    expect(input.type).toBe("password");
  });

  it("muestra error si existe", () => {
    render(<Input id="email" value="" onChange={() => {}} error="Email requerido" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Email requerido");
  });

  it("renderiza input tipo file y muestra preview al seleccionar imagen", () => {
    const handleChange = jest.fn();
    render(<Input id="photo" type="file" value="" onChange={handleChange} />);
    const fileInput = screen.getByLabelText(/cargar imagen/i);
    const file = new File(["test"], "photo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(handleChange).toHaveBeenCalled();
    const preview = screen.getByAltText("Preview");
    expect(preview).toBeInTheDocument();
  });

  it("no genera preview si no hay archivo seleccionado", () => {
    const handleChange = jest.fn();
    render(<Input id="photo" type="file" value="" onChange={handleChange} />);
    const preview = screen.queryByAltText("Preview");
    expect(preview).not.toBeInTheDocument();
  });
});