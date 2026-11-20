// Obtiene el GOOGLE_OAUTH_REFRESH_TOKEN con la cuenta de Google de Diana (una sola vez).
// Uso:
//   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... node scripts/google-oauth.mjs
// Abre el enlace que imprime, entra con la cuenta de Diana y acepta. El token aparece en la terminal.
// El cliente OAuth debe ser de tipo «App de escritorio» (ver AGENDA.md).
import { createServer } from "node:http";

const id = process.env.GOOGLE_OAUTH_CLIENT_ID;
const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
if (!id || !secret) {
  console.error("Faltan GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET.");
  process.exit(1);
}

const PORT = 53682;
const redirect = `http://127.0.0.1:${PORT}`;
const scope = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file";
const url =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({ client_id: id, redirect_uri: redirect, response_type: "code", scope, access_type: "offline", prompt: "consent" });

const server = createServer(async (req, res) => {
  const code = new URL(req.url, redirect).searchParams.get("code");
  if (!code) {
    res.end("Esperando autorización…");
    return;
  }
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: "authorization_code" }),
  });
  const json = await r.json();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  if (!json.refresh_token) {
    res.end("No llegó el refresh token. Revisa la terminal.");
    console.error(json);
  } else {
    res.end("Listo. Ya puedes cerrar esta pestaña y volver a la terminal.");
    console.log("\nCopia esta línea en .env.local (y en las variables del hosting):\n");
    console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${json.refresh_token}\n`);
  }
  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Abre este enlace con la cuenta de Google de Diana:\n");
  console.log(url + "\n");
});
