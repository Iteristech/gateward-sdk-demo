// Dev-only: crea ecosystem, pool, app y API key en un Core local y deja .env listo.
// Uso: PLATFORM_EMAIL=... PLATFORM_PASSWORD=... pnpm provision
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const core = process.env.GATEWARD_URL || "http://localhost:8080";
const { PLATFORM_EMAIL: email, PLATFORM_PASSWORD: password } = process.env;
const scopes = [
  "events:write", "users:write_app", "users:read_app", "app:user_manage",
  "invitations:write", "waitlist:manage", "notifications:send",
];

if (!email || !password) {
  console.error("faltan PLATFORM_EMAIL y PLATFORM_PASSWORD (el platform_admin del Core)");
  process.exit(1);
}

let token;
async function call(path, body) {
  const res = await fetch(core + path, {
    method: "POST",
    headers: { "content-type": "application/json", ...(token && { authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status} ${text}`);
  return JSON.parse(text);
}

try {
  token = (await call("/v1/auth/platform-login", { email, password })).access_token;
  const suffix = Date.now().toString(36);
  const eco = await call("/v1/ecosystems", { name: `demo-${suffix}` });
  const pool = await call("/v1/identity-pools", { ecosystem_id: eco.id, name: `demo-pool-${suffix}`, mode: "ecosystem_shared" });
  const app = await call("/v1/apps", {
    ecosystem_id: eco.id, identity_pool_id: pool.id, name: `demo-app-${suffix}`,
    identity_mode: "ecosystem_shared", environment: "test",
    allowed_origins: ["http://localhost:5173"],
  });
  const key = await call("/v1/admin/api-keys", {
    ecosystem_id: eco.id, identity_pool_id: pool.id, app_id: app.id,
    email: `demo-${suffix}@service.local`, scopes,
  });
  const apiKey = key.key ?? key.api_key;
  if (!apiKey) throw new Error("la respuesta no trae la key: " + Object.keys(key).join(","));

  if (!existsSync(".env")) copyFileSync(".env.example", ".env");
  const values = { VITE_GATEWARD_APP_ID: app.id, GATEWARD_APP_ID: app.id, GATEWARD_API_KEY: apiKey };
  let env = readFileSync(".env", "utf8");
  for (const [k, v] of Object.entries(values)) env = env.replace(new RegExp(`^${k}=.*$`, "m"), `${k}=${v}`);
  writeFileSync(".env", env);
  console.log(`app ${app.id} lista; .env actualizado (la key no se vuelve a mostrar)`);
} catch (e) {
  console.error("fallo:", e.message);
  process.exit(1);
}
