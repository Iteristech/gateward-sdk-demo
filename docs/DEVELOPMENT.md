# Desarrollo

Setup, gate y flujo de trabajo. Qué hace cada botón y el flujo de prueba están en el [README](../README.md).

## Setup
- El SDK se consume como `file:../gateward-sdk` (ver `package.json`): clona `gateward-sdk` al lado y compílalo, porque se usa desde su `dist/`.
- Necesitas un Core local (`gateward-core`) con CORS para `http://localhost:5173`. Los pasos del Core, la app y la API key están en el [README](../README.md#setup); las credenciales de dev que figuran ahí son las únicas que se documentan.
- Copia `.env.example` a `.env` y completa los ids y la API key. La key va sin prefijo `VITE_` para que no llegue al browser.
- Para las tarjetas Access y Mailing list la key necesita los scopes que lista `.env.example`.

## Gate
`pnpm build` (`tsc --noEmit && vite build`) es el único chequeo del repo, igual que en CI. No hay lint ni tests.

Ejecutado el 2026-10-15 con `pnpm install --frozen-lockfile` y `pnpm build`: pasó.

## Verificación pendiente
**No verificado:** el demo no se ha probado contra un Core vivo ni en un navegador real en esta tanda. Solo se comprobó que compila. Ver DEMO-003 en [TASK_TODO.md](TASK_TODO.md).

## Ramas y PR
- Una rama por cambio, PR a `main`, CI verde y squash-merge.
- `main` no despliega. `stg` y `prod` reciben solo PRs de promoción, con merge commit y nunca squash.
- Un PR no se mergea en rojo.

## Reglas
- Cada cambio (PR) cabe en 400-500 líneas de código.
- El repo es público: sin nombres de proyectos internos, hosts ni credenciales reales.
- CI ([workflow](../.github/workflows/strongback-ci.yml)): los PRs de forks corren en `ubuntu-latest`; no se usa `pull_request_target` con checkout del PR. Sin caches, con `timeout-minutes` y `concurrency`.
- Lo que se afirma en docs sin haberlo ejecutado se marca "no verificado".
