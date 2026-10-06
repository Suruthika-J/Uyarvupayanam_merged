/**
 * Single source of truth for the JWT signing/verification secret.
 *
 * Production safety:
 *   When NODE_ENV === "production" the server MUST be started with a real
 *   JWT_SECRET. A missing/blank secret throws, and the server.js boot guard
 *   turns that into a hard startup failure (`[FATAL] ... ; process.exit(1)`),
 *   so the insecure development fallback can never be used against deployed
 *   traffic.
 *
 * Local development:
 *   A configured JWT_SECRET always takes precedence. Without one, an explicit
 *   JWT_DEV_SECRET is used, and as a last resort a clearly named development
 *   fallback keeps `nodemon`-style local flows working. Neither fallback is
 *   reachable under NODE_ENV=production.
 *
 * Why not keep `process.env.JWT_SECRET || "fallback_secret"` inline:
 *   that pattern silently signs real-looking tokens with a guessable secret
 *   even in production, which is a privilege-escalation risk.
 */
function getJwtSecret() {
  const configured = process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required when NODE_ENV=production");
  }

  const devSecret = process.env.JWT_DEV_SECRET && String(process.env.JWT_DEV_SECRET).trim();
  if (devSecret) return devSecret;

  return "fallback_secret";
}

module.exports = getJwtSecret;