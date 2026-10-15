import type { NextConfig } from "next";

const istProduktion = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  "img-src 'self' data: https://a.impactradius-go.com",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  // Next.js Hydrierung braucht Inline Skripte. Im Entwicklungsmodus zusätzlich eval (Fast Refresh).
  `script-src 'self' 'unsafe-inline'${istProduktion ? "" : " 'unsafe-eval'"}`,
  "connect-src 'self'",
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "media-src 'self' https://download.odoocdn.com https://cas.s3-cdn.welocal.cloud https://media.eurodata.de https://www.weclapp.com https://stream.mux.com https://www.zohowebstatic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const sicherheitsKoepfe = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  // Inline-Mailbilder müssen auch im Dateisystem der Vercel Function liegen.
  outputFileTracingIncludes: {
    "/api/**": ["./public/marke/startkontor-email-logo.png"],
  },
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 480, 640, 768, 960, 1280, 1600, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  async headers() {
    return [
      { source: "/:path*", headers: sicherheitsKoepfe },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
