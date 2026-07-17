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

  it("renders a lazy child route with navigation", async () => {
    renderAt("/home");

    expect(await screen.findByRole("heading", { name: "Hola, Luna" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
  });
});
