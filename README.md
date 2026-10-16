# Gateward SDK Demo

App runnable que ejercita **las dos mitades** de `@gateward/sdk` contra un Core local:

- **Browser** (`GatewardAuth`): config pública de la app y guarda de environment
  (`ready`), validación local del password contra la policy real, register (con auto-login
  si la app no exige verificación) / login / refresh / logout, perfil propio, change
  password, sesiones y `revokeAllSessions`, miembros y roles (`listMembers` /
  `setMemberRole`, con refresh automático al cambiarte a vos mismo), cambio de email en
  dos pasos (`changeEmail` → `verifyEmailChange`) y `deleteAccount`.
- **Server-side** (`GatewardServer`, vía un plugin de Vite): `sendEvent` y `verifyToken`
  con la **API key** — que **nunca llega al browser** (vive solo en Node).

Es la referencia de integración canónica: replica el patrón real (browser hace auth de
usuario; el backend, con la API key, emite eventos y verifica tokens).

> **Nota:** este demo consume el SDK por `file:../gateward-sdk`, o sea que
> espera el repo [`gateward-sdk`](https://github.com/Iteristech/gateward-sdk)
> clonado al lado. Cuando `@gateward/sdk` esté publicado en npm, cambiá esa
> línea de `package.json` por la versión y desaparece el requisito.

## Setup

1. **Levantá el Core local** (repo `gateward-core`):
   ```bash
   make run   # docker + migraciones + :8080
   make bootstrap-admin EMAIL=admin@local.test PASSWORD='Admin!Pass123'
   ```
   Asegurate de que el Core tenga `CORS_ALLOWED_ORIGINS=http://localhost:5173` en su `.env`
   (el browser llama cross-origin).

2. **Aprovisioná app + api key** (platform-login → ecosystem → pool → app → api key con
   scopes `events:write`, `events:read_app`, `users:write_app`; para los botones de miembros y
   las tarjetas de acceso, además los de `.env.example`). Rápido con el Swagger
   (`ENABLE_SWAGGER_UI=true`, `/swagger-ui`) o por `curl`. Guardá el `app_id` y la `key`.

3. **Configurá el demo:**
   ```bash
   cp .env.example .env      # completá VITE_GATEWARD_APP_ID, GATEWARD_APP_ID, GATEWARD_API_KEY
   pnpm -C ../gateward-sdk build   # el SDK se consume por file: → necesita dist/
   pnpm install
   ```

4. **Corré:**
   ```bash
   pnpm dev      # http://localhost:5173
   ```

## Qué ejercita

| Browser (`GatewardAuth`) | Server (`GatewardServer`, API key) |
|---|---|
| register (detecta auto-login), login, refresh, logout | `verifyToken` vía JWKS |
| `getUser`, `updateProfile`, `changePassword` | `sendEvent` |
| `listSessions`, `revokeAllSessions` | `updateUserMetadata` |
| `onAuthStateChange` → todo evento al log | `listMembers`, `setMemberRole` (ROLE-001) |
| Tarjetas Access, Mailing list, Contact form (ver abajo) | `createInvitations`, `releaseWaitlist`, `broadcast` |

El log muestra los eventos de sesión aunque no los dispare un botón: un refresh
token muerto o un logout en otra pestaña aparecen igual.

## Flujo de prueba

1. **register** → 202 (el Core exige verificar email antes de login).
2. Marcá el usuario verificado (no hay SMTP local):
   ```bash
   pnpm verify-user demo@example.com
   ```
3. **login** → guarda tokens y muestra los claims. **refresh** los rota. **sessions** lista
   las propias. **me** trae el perfil; **update profile** escribe su metadata.
4. **verify token (server)** → el backend del demo valida el JWT vía JWKS (ES256).
5. **send event (server)** → emite `app.demo.button_clicked` con la API key.
6. **revoke others** cierra las demás sesiones sin tocar esta.
7. **list members (server)** lista el padrón de la app con la API key.
8. **logout** → limpia la sesión.

## Estructura

- `src/App.tsx` — UI + uso de `GatewardAuth` (browser).
- `src/Access.tsx` — tarjetas Access, Mailing list y Contact form.
- `src/api.ts` — cliente de las rutas `/api/*` del propio demo.
- `server/plugin.ts` — plugin de Vite con `GatewardServer`: `/api/send-event`, `/api/verify`, `/api/members`, `/api/set-role`, `/api/set-metadata`, `/api/invite`, `/api/release-waitlist` y `/api/broadcast`.
- `vite.config.ts` — separa env de browser (`VITE_*`) del de servidor (API key).
- `scripts/verify-user.mjs` — helper dev para marcar un usuario verificado.

## Lo que cada botón espera que sepas

- **ready / App config** corre solo al cargar. Con `VITE_GATEWARD_EXPECT_ENV=test` en el
  `.env`, el SDK se niega a registrar o loguear si la app apunta a otro environment: es la
  guarda que evita que un build de QA cree usuarios en producción.
- **list members / make me app_admin** necesitan `app:user_manage`. Un miembro normal recibe
  403 (así se ve en el log). El primer `app_admin` lo promueve un platform admin desde el
  dashboard; después ese admin puede promover a otros.
- **change email** manda el token a la dirección **nueva**. Sin SMTP, el Core lo escribe en
  su log como `email_change_token`; pegalo en el input y **verify email change** lo confirma.
  Confirmar revoca todas las sesiones: hay que volver a loguear con el email nuevo.
- **delete account** es irreversible y pide el password. Da de baja la membership de esta app;
  la identidad se anonimiza solo si no queda en ninguna otra app del pool.

## Acceso, listas y formulario de contacto

Tres tarjetas ejercitan lo que el SDK trae para acceso controlado; la interfaz es del propio demo
(el SDK no trae UI). Diseño en `ACCESS_AND_NOTIFICATIONS.md` del Core (`docs/FEATURES`).

| Tarjeta | Qué hace | Prepara en el Core |
|---|---|---|
| **Access** | muestra `registration_mode`; registra con un código (`inviteToken`); entra y confirma la lista de espera; "invite this email" y "release 1" desde el servidor | `PATCH /v1/apps/{id}` con `registration_mode`; la API key con `invitations:write` y `waitlist:manage` |
| **Mailing list** | suscribe y confirma, baja por token, preferencias del usuario con sesión y difusión desde el servidor | una lista (`POST /v1/apps/{id}/lists`); la key con `notifications:send` |
| **Contact form** | `getForm` y dibuja los campos que describe, `submitForm` con campo trampa y hora de muestra, y los errores por campo de `GatewardError.fieldErrors` | un formulario (`PUT /v1/apps/{id}/forms/contact`) |

Los códigos de confirmación salen en el log del Core (`waitlist_token`, `list_token`) cuando no hay
SMTP; el dashboard permite crear todo lo de la columna derecha sin `curl`.

## Cómo se trabaja

Setup, gate, flujo de ramas y reglas de CI: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md). Índice de docs: [docs/README.md](docs/README.md).
