import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

describe("ProfileView component", () => {
  it("should render without crashing", async () => {
    const ProfileView = (await import("@/features/admin/users/ui/profile-view")).default;
    const profile = {
      id: "1", login: "admin", name: "Admin User", email: "admin@test.com",
      phone: "+375291111111", photo: null, position: "Главный администратор",
      birth_date: "1990-01-01", work_schedule: "full_time", hire_date: "2024-01-15",
      telegram: "@admin", bio: "About me", roles: [{ id: "1", name: "Администратор" }],
    };

    const { container } = render(React.createElement(ProfileView, { profile: profile as any }));
    expect(container.querySelector("h2")).toBeTruthy();
  });
});

describe("MultiSelect component", () => {
  it("should render without crashing", async () => {
    const MultiSelect = (await import("@/shared/ui/admin/multi-select")).default;
    const { container } = render(
      React.createElement(MultiSelect, {
        options: [{ value: "1", label: "Option 1" }],
        values: [],
        onChange: () => {},
        placeholder: "Выберите...",
      })
    );
    expect(container.querySelector("button")).toBeTruthy();
  });
});

describe("PasswordSection component", () => {
  it("should render without crashing", async () => {
    const PasswordSection = (await import("@/features/admin/users/ui/password-section")).default;
    const { container } = render(
      React.createElement(PasswordSection, {
        oldPassword: "", setOldPassword: () => {},
        newPassword: "", setNewPassword: () => {},
        confirmPassword: "", setConfirmPassword: () => {},
        showPw: false, setShowPw: () => {},
        pwError: "Ошибка",
      })
    );
    expect(container.textContent).toContain("Текущий пароль");
    expect(container.textContent).toContain("Новый пароль");
    expect(container.textContent).toContain("Ошибка");
  });
});
