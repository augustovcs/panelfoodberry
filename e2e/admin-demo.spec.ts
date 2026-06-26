import { test, expect } from "@playwright/test";

test("login demo dá acesso ao painel e à cozinha", async ({ page }) => {
  await page.goto("/login");

  // Botão demo visível quando Supabase não está configurado
  const demoBtn = page.getByRole("button", { name: "Acessar demo" });
  await expect(demoBtn).toBeVisible();
  await demoBtn.click();

  // Dashboard
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // Cozinha mostra um pedido demo
  await page.goto("/cozinha");
  await expect(page.getByText("#A7K2P")).toBeVisible();
  await expect(page.getByText("João Silva")).toBeVisible();
});

test("rota admin sem sessão redireciona para login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
