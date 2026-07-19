import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const profileContext = vi.hoisted(() => ({
  value: {
    status: "active",
    activeProfile: { id: "profile-1", name: "Luna", role: "child" },
    children: [],
    refresh: vi.fn(),
    createAdmin: vi.fn(),
    createChild: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock("../core/profiles/ProfileContext", () => ({
  useProfiles: () => profileContext.value,
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App shell", () => {
  beforeEach(() => {
    profileContext.value.status = "active";
    profileContext.value.activeProfile = { id: "profile-1", name: "Luna", role: "child" };
  });

  it("renders the welcome route", async () => {
    renderAt("/");

    expect(await screen.findByRole("heading", { name: "Mi Super Diario" })).toBeInTheDocument();
    expect(screen.getByText(/Tus recuerdos, solo tuyos/i)).toBeInTheDocument();
  });

  it("renders the game home with its compact navigation", async () => {
    renderAt("/home");

    expect(await screen.findByRole("heading", { name: "Hola, Luna" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Solete. Puedes moverlo por la pantalla." })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Navegación principal" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Diario" })).toHaveAttribute("href", "/diary");
    expect(screen.getByRole("link", { name: "0 estrellas disponibles" })).toHaveAttribute("href", "/store");
    expect(screen.getByRole("link", { name: "Ajustes" })).toHaveAttribute("href", "/settings");
  });
});
