import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App shell", () => {
  it("renders the welcome route", async () => {
    renderAt("/");

    expect(await screen.findByRole("heading", { name: "Mi Super Diario" })).toBeInTheDocument();
    expect(screen.getByText(/Beta privada/i)).toBeInTheDocument();
  });

  it("renders a lazy child route with navigation", async () => {
    renderAt("/home");

    expect(await screen.findByRole("heading", { name: "Que quieres guardar hoy?" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegacion principal" })).toBeInTheDocument();
  });
});
