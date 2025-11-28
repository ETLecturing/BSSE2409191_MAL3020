import { render, screen } from "@testing-library/react";
import HomePage from "../pages/general/HomePage.jsx";
import { describe, it, expect } from "vitest";

describe("HomePage Component", () => {
  it("renders the title correctly", () => {
    render(<HomePage />);
    expect(
      screen.getByText("Welcome to Restaurant Ordering System")
    ).toBeInTheDocument();
  });

  it("shows public homepage instructions when no user is logged in", () => {
    render(<HomePage />);
    expect(screen.getByText(/browse our menu/i)).toBeInTheDocument();

    expect(screen.getByText(/🍔 Browse Menu/)).toBeInTheDocument();
    expect(screen.getByText(/🧾 Place Orders/)).toBeInTheDocument();
    expect(screen.getByText(/👨‍🍳 Staff Access/)).toBeInTheDocument();
  });

  it("greets a logged-in customer", () => {
    const user = { name: "Zul", role: "customer" };

    render(<HomePage user={user} />);

    expect(
      screen.getByText("Hi Zul! You are logged in as customer.")
    ).toBeInTheDocument();

    // note: Customer should see their dashboard card
    expect(
      screen.getByText(/🧾 Dashbaord/i) 
    ).toBeInTheDocument();
  });

  it("shows admin dashboard card for admin", () => {
    const user = { name: "AdminUser", role: "admin" };

    render(<HomePage user={user} />);

    expect(
      screen.getByText("Hi AdminUser! You are logged in as admin.")
    ).toBeInTheDocument();

    expect(screen.getByText(/📋 Admin Dasboard/i)).toBeInTheDocument();
  });

  it("shows admin dashboard card for worker", () => {
    const user = { name: "WorkerUser", role: "worker" };

    render(<HomePage user={user} />);

    expect(
      screen.getByText("Hi WorkerUser! You are logged in as worker.")
    ).toBeInTheDocument();

    expect(screen.getByText(/📋 Admin Dasboard/i)).toBeInTheDocument();
  });
});
