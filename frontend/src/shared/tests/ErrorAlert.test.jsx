import { render, screen } from "@testing-library/react";
import { ErrorAlert } from "@components/ErrorAlert";

describe("ErrorAlert", () => {
  it("no renderiza nada si no hay mensajes", () => {
    const { container } = render(<ErrorAlert>{null}</ErrorAlert>);
    expect(container.firstChild).toBeNull();
  });

  it("muestra un mensaje simple", () => {
    render(<ErrorAlert>Algo salió mal</ErrorAlert>);
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
  });

  it("divide un string por líneas", () => {
    render(<ErrorAlert>{"Uno\nDos\nTres"}</ErrorAlert>);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("acepta array de mensajes", () => {
    render(<ErrorAlert>{["A", "B", "C"]}</ErrorAlert>);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});