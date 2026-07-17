export const serverConfig = {
  port: Number(process.env.PORT || process.env.CMS_API_PORT || 3001),
  corsOrigin: process.env.CMS_API_CORS_ORIGIN || "http://localhost:8080",
};
