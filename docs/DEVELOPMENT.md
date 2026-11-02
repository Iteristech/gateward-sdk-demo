# Desarrollo

Setup, gate y flujo de trabajo. Qué hace cada botón y el flujo de prueba están en el [README](../README.md).

## Setup
Los pasos numerados (clonar, Core, compilar el SDK, `pnpm provision`, `pnpm dev`), la salida esperada y los errores comunes están en el [README](../README.md#setup). Dos cosas que importan al desarrollar:
- El SDK se consume como `file:../gateward-sdk` y pnpm lo copia al instalar: tras cambiar el SDK, compilalo y corré `pnpm install` en el demo.
- La API key va sin prefijo `VITE_` para que no llegue al browser. Para Access y Mailing list necesita los scopes de `.env.example` (`pnpm provision` ya los pide).

## Gate
`pnpm build` (`tsc --noEmit && vite build`) es el único chequeo del repo, igual que en CI. No hay lint ni tests.

Ejecutado el 2026-10-15 con `pnpm install --frozen-lockfile` y `pnpm build`: pasó.

## Verificación
Ejecutado el 2026-10-16 desde un clon limpio, siguiendo solo el README, contra un Core local (Node 26.0.0, pnpm 10.23.0):
- Verificado: clonar, compilar el SDK, `pnpm install`, `pnpm provision`, `pnpm dev`; register (202), login (403 sin verificar, 200 tras `pnpm verify-user`); `/api/verify`, `/api/members`, `/api/send-event`, `/api/set-metadata`, `/api/invite` y `/api/release-waitlist` por curl; CORS del Core para `http://localhost:5173`.
- **No verificado:** la UI en un navegador (botones, log, cambio de email, borrado de cuenta), `/api/set-role`, `/api/broadcast` con una lista real, el formulario de contacto y `make bootstrap-admin` (se usó el admin que ya existía). Ver DEMO-003 en [TASK_TODO.md](TASK_TODO.md).

## Ramas y PR
- Una rama por cambio, PR a `main`, CI verde y squash-merge.
- `main` no despliega. `stg` y `prod` reciben solo PRs de promoción, con merge commit y nunca squash.
- Un PR no se mergea en rojo.

## Reglas
- Cada cambio (PR) cabe en 400-500 líneas de código.
- El repo es público: sin nombres de proyectos internos, hosts ni credenciales reales.
- CI ([workflow](../.github/workflows/strongback-ci.yml)): los PRs de forks corren en `ubuntu-latest`; no se usa `pull_request_target` con checkout del PR. Sin caches, con `timeout-minutes` y `concurrency`.
- Lo que se afirma en docs sin haberlo ejecutado se marca "no verificado".
