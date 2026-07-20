export const serverConfig = {
  port: Number(process.env.PORT || process.env.CMS_API_PORT || 3001),
  // `true` reflects the request Origin (Hostinger same-app + local Vite).
  // Override with CMS_API_CORS_ORIGIN when you need a fixed allowlist.
  corsOrigin: process.env.CMS_API_CORS_ORIGIN || true,
};
