# Backlog de gateward-sdk-demo

> Historial en [TASK_COMPLETED/](./TASK_COMPLETED/). Gate y flujo en [DEVELOPMENT.md](./DEVELOPMENT.md).

## Priority 1

### DEMO-003: Verificar el demo de punta a punta `added: 2026-10-15`
- [ ] Probar contra un Core local y en navegador real: registro, login, refresh, sesiones, miembros, cambio de email, borrado de cuenta
- [ ] Probar las tarjetas Access, Mailing list y Contact form, y las rutas `/api/invite`, `/api/release-waitlist` y `/api/broadcast`
- [ ] Al terminar, quitar la marca "no verificado" de DEVELOPMENT.md

## Priority 2

### DEMO-004: Chequeos automáticos `added: 2026-10-15`
- [ ] El gate es solo `tsc` y `vite build`; no hay lint ni tests (no verificado si hace falta más)
- [ ] `verify-user.mjs` asume un contenedor de Postgres local con credenciales fijas; documentar o parametrizar
- [ ] Cuando `@gateward/sdk` se publique en npm, cambiar `file:../gateward-sdk` por la versión y quitar el checkout hermano del CI
