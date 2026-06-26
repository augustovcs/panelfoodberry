import { test, expect } from "@playwright/test";

test("cardápio carrega e adiciona item ao carrinho", async ({ page }) => {
  await page.goto("/");

  // Restaurante + destaques visíveis
  await expect(page.getByText("Destaques")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Hambúrgueres" }),
  ).toBeVisible();

  // Abre um item e adiciona
  await page
    .getByRole("button", { name: /Smash Clássico/ })
    .first()
    .click();
  await page.getByRole("button", { name: /Adicionar/ }).click();

  // Carrinho flutuante (mobile) ou sidebar mostra o item
  await expect(
    page.getByText("Ver pedido").or(page.getByText("Seu pedido")),
  ).toBeVisible();
});

test("busca filtra itens", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Buscar no cardápio…").fill("pizza");
  await expect(page.getByText(/resultado/i)).toBeVisible();
});
