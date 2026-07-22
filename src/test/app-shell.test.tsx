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

  it("renders the family foyer with existing profiles plus one empty door and adult access", async () => {
    renderAt("/profiles");

    expect(await screen.findByRole("region", { name: "Seleccionar perfil" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Crear perfil en la puerta/ })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Abrir Control familiar" })).toHaveAttribute("href", "/admin");
  });

  it("renders the door workshop for a new profile", async () => {
    renderAt("/profiles/new");

    expect(await screen.findByRole("heading", { name: "Prepara tu puerta" })).toBeInTheDocument();
    expect(screen.getByLabelText("¿Cómo te llamas?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Colocar mi puerta" })).toBeInTheDocument();
  });

  it("renders the game home with its compact navigation", async () => {
    renderAt("/home");

    expect(await screen.findByRole("heading", { name: "Hola, Luna" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Solete, personaje del mundo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tienda: Kiosco de mundos" })).toHaveAttribute("href", "/store");
    expect(screen.getByRole("link", { name: "Historial: Librería de recuerdos" })).toHaveAttribute("href", "/diary");
    expect(screen.queryByRole("navigation", { name: "Navegación principal" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir la tienda. Tienes 0 estrellas" })).toHaveAttribute("href", "/store");
    expect(screen.getByRole("link", { name: "Abrir ajustes" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("button", { name: "Salir del perfil y volver a la selección de perfiles" })).toBeInTheDocument();
  });
});
