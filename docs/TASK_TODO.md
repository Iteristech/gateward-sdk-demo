# Backlog de gateward-sdk-demo

> Historial en [TASK_COMPLETED/](./TASK_COMPLETED/). Gate y flujo en [DEVELOPMENT.md](./DEVELOPMENT.md).

## Priority 1

### DEMO-003: Verificar el demo contra un Core local `added: 2026-10-15`
Onboarding: si

Hoy el demo solo se sabe que compila (`pnpm build`); nadie lo ha corrido contra un Core vivo.

Pasos:
- [ ] Clona `gateward-core`, `gateward-sdk` y este repo lado a lado; compila el SDK (`pnpm -C ../gateward-sdk build`)
- [ ] En `gateward-core`: `make run`, `make bootstrap-admin` y `CORS_ALLOWED_ORIGINS=http://localhost:5173` en su `.env`
- [ ] Crea app y API key con los scopes de [README](../README.md#setup) y `.env.example`; `cp .env.example .env` y completa `VITE_GATEWARD_APP_ID`, `GATEWARD_APP_ID`, `GATEWARD_API_KEY`
- [ ] `pnpm dev` y recorre el "Flujo de prueba" del README en un navegador (`pnpm verify-user <email>` marca verificado)
- [ ] Prueba cambio de email (token en el log del Core) y borrado de cuenta
- [ ] Prueba las tarjetas Access, Mailing list y Contact form, que usan `/api/invite`, `/api/release-waitlist` y `/api/broadcast` (preparación en la sección "Acceso, listas y formulario de contacto" del README)

Hecho cuando: cada botón del README responde como describe (o queda abierta una tarea por cada discrepancia, con el paso que falla) y se quita la marca "no verificado" de [DEVELOPMENT.md](./DEVELOPMENT.md).

## Priority 2

### DEMO-004: Chequeos y dependencias `added: 2026-10-15`
- [ ] Decidir si hace falta lint o tests; hoy el gate es solo `tsc --noEmit && vite build` (`package.json`, workflow de CI)
- [ ] `scripts/verify-user.mjs` toma el contenedor de `PG_CONTAINER` (por defecto `gateward-core-postgres-1`) pero tiene fijos usuario, base y password de Postgres; parametrizar o documentarlo en README y escapar el email del SQL
- [ ] Cuando `@gateward/sdk` se publique en npm, cambiar `file:../gateward-sdk` por la versión y quitar el checkout hermano de `.github/workflows/strongback-ci.yml`
