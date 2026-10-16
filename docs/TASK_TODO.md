# Backlog de gateward-sdk-demo

> Historial en [TASK_COMPLETED/](./TASK_COMPLETED/). Gate y flujo en [DEVELOPMENT.md](./DEVELOPMENT.md).

## Priority 1

### DEMO-003: Verificar el demo contra un Core local `added: 2026-10-15`
Onboarding: si

Verificado el 2026-10-16 por curl desde un clon limpio (detalle en [DEVELOPMENT.md](./DEVELOPMENT.md#verificación)): setup, `pnpm provision`, `pnpm dev`, register/login y las rutas `/api/*` salvo las de abajo. Falta la parte de navegador.

Pasos pendientes:
- [ ] Recorrer el "Flujo de prueba" del README en un navegador, botón por botón
- [ ] Probar cambio de email (token en el log del Core) y borrado de cuenta
- [ ] Probar las tarjetas Access, Mailing list y Contact form (con lista y formulario creados en el Core) y `/api/set-role`
- [ ] Probar `make bootstrap-admin` desde cero con el Core

Hecho cuando: cada botón del README responde como describe (o queda abierta una tarea por cada discrepancia, con el paso que falla) y se quita lo "no verificado" de [DEVELOPMENT.md](./DEVELOPMENT.md).

## Priority 2

### DEMO-004: Chequeos y dependencias `added: 2026-10-15`
- [ ] Decidir si hace falta lint o tests; hoy el gate es solo `tsc --noEmit && vite build` (`package.json`, workflow de CI)
- [ ] `scripts/verify-user.mjs` toma el contenedor de `PG_CONTAINER` (por defecto `gateward-core-postgres-1`) pero tiene fijos usuario, base y password de Postgres; parametrizar o documentarlo en README y escapar el email del SQL
- [ ] Cuando `@gateward/sdk` se publique en npm, cambiar `file:../gateward-sdk` por la versión y quitar el checkout hermano de `.github/workflows/strongback-ci.yml`
