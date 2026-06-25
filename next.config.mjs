/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone build = pacote mínimo p/ rodar com `node` na Hostinger (PM2). Ver ARCHITECTURE §11.
  output: "standalone",
  images: {
    remotePatterns: [
      // Fotos de demonstração enquanto não há foto própria no Storage.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage (bucket `menu`) — host preenchido via env na Fase 1.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
