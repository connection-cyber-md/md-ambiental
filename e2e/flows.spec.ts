import { test, expect } from "@playwright/test";

test.describe("MD Ambiental - Fluxos Críticos E2E", () => {
  
  test("deve carregar a pagina de login corretamente", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText(/acessar o sistema/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("deve redirecionar usuario nao autenticado ao tentar acessar o admin", async ({ page }) => {
    await page.goto("/admin");
    // O middleware deve redirecionar para a tela de login
    await expect(page).toHaveURL(/login/);
  });

  test("deve validar a saude da api de webhook e endpoints", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBeLessThan(500);
  });

});