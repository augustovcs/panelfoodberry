// PM2 — execução do Next.js (build standalone) na Hostinger. Ver ARCHITECTURE.md §11.
//
// Deploy (resumo):
//   npm ci && npm run build
//   # o build standalone fica em .next/standalone; copie os assets:
//   cp -r .next/static .next/standalone/.next/static
//   cp -r public .next/standalone/public   2>/dev/null || true
//   pm2 start ecosystem.config.cjs && pm2 save
//
// Variáveis de ambiente vêm do .env (NÃO commitado). Reverse proxy (Nginx/LiteSpeed)
// encaminha o domínio e o subdomínio admin para a PORT abaixo.

module.exports = {
  apps: [
    {
      name: "anotabem",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
    },
  ],
};
