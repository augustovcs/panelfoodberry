import { defineConfig, devices } from "@playwright/test";

/**
 * E2E (Fase 8). Para rodar: `npx playwright install` (baixa os browsers) e então
 * `npm run test:e2e`. O webServer sobe o app em modo mock (sem Supabase → demo
 * auto-on), então login/cozinha funcionam sem banco.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
