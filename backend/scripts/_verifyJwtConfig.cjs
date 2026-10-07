/**
 * _verifyJwtConfig.cjs — static (no server) verification of the JWT secret
 * resolution policy in utils/jwtSecret.js.
 *
 *   production + JWT_SECRET  -> secret used
 *   production, no secret    -> THROWS (boot guard refuses to start)
 *   dev/test, no secret      -> JWT_DEV_SECRET or development fallback
 *   production + blank secret-> THROWS
 *
 * Usage: node scripts/_verifyJwtConfig.cjs
 * Exit code 0 = all assertions passed.
 */
"use strict";
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const getJwtSecret = require("../utils/jwtSecret");

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

function withEnv(env, fn) {
  const saved = {};
  for (const [k, v] of Object.entries(env)) {
    saved[k] = process.env[k];
    process.env[k] = v;
  }
  const removed = Object.keys(process.env).filter((k) => env[k] === undefined && /^(NODE_ENV|JWT_SECRET|JWT_DEV_SECRET)$/.test(k));
  for (const k of removed) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

// 1. production with a real secret -> secret returned
withEnv({ NODE_ENV: "production", JWT_SECRET: "production-secret-key" }, () => {
  check("production + JWT_SECRET uses the configured secret",
    getJwtSecret() === "production-secret-key", `got=${getJwtSecret()}`);
});

// 2. production WITHOUT a secret -> must throw (boot-guard path)
withEnv({ NODE_ENV: "production" }, () => {
  let threw = null;
  try {
    getJwtSecret();
  } catch (e) {
    threw = e.message;
  }
  check("production without JWT_SECRET throws (fail-safe)",
    !!threw && /JWT_SECRET is required/.test(threw), threw || "NO_THROW");
});

// 3. production with a BLANK secret -> must throw too
withEnv({ NODE_ENV: "production", JWT_SECRET: "   " }, () => {
  let threw = null;
  try {
    getJwtSecret();
  } catch (e) {
    threw = e.message;
  }
  check("production with blank JWT_SECRET throws (fail-safe)",
    !!threw && /JWT_SECRET is required/.test(threw), threw || "NO_THROW");
});

// 4. development without any secret -> development-only fallback works
withEnv({}, () => {
  check("development without secrets returns dev fallback",
    getJwtSecret() === "fallback_secret", `got=${getJwtSecret()}`);
});

// 5. development with JWT_DEV_SECRET -> that secret is used
withEnv({ JWT_DEV_SECRET: "dev-only-key" }, () => {
  check("development uses explicit JWT_DEV_SECRET",
    getJwtSecret() === "dev-only-key", `got=${getJwtSecret()}`);
});

// 6. JWT_SECRET always wins when present (any environment)
withEnv({ NODE_ENV: "development", JWT_SECRET: "real-env-key", JWT_DEV_SECRET: "dev-only-key" }, () => {
  check("configured JWT_SECRET takes precedence over dev secret",
    getJwtSecret() === "real-env-key", `got=${getJwtSecret()}`);
});

const failed = results.filter((r) => !r.ok);
console.log(`\nJWT CONFIG VERIFY — ${results.length} checks, ${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);