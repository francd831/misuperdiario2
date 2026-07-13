import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App shell", () => {
  it("renders the rebuild starting point", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Mi Super Diario" })).toBeInTheDocument();
    expect(screen.getByText(/Rebuild desde especificacion/i)).toBeInTheDocument();
  });
});
