# gateward-sdk-demo

App runnable que ejercita toda la superficie de `@gateward/sdk` contra un Core local. Es la referencia de integración canónica: el browser hace auth de usuario y un plugin de Vite hace de backend con la API key.

## Qué demuestra
- Browser con `GatewardAuth`: registro, login, refresh, perfil, sesiones, miembros y roles, cambio de email, borrado de cuenta.
- Servidor con `GatewardServer`: `sendEvent`, `verifyToken`, metadata, miembros, invitaciones, lista de espera y difusión.
- Tarjetas Access, Mailing list y Contact form. La UI es del demo; el SDK solo comunica.

## Dónde está cada cosa
- `src/App.tsx`: UI principal y uso de `GatewardAuth`.
- `src/Access.tsx`: las tres tarjetas de acceso, listas y formulario.
- `src/api.ts`: llamadas del browser a `/api/*`.
- `server/plugin.ts`: plugin de Vite con las rutas `/api/*` y la API key (nunca llega al browser).
- `vite.config.ts`: separa el env de browser (`VITE_*`) del de servidor.
- `scripts/verify-user.mjs`: helper de desarrollo para marcar un usuario verificado.
- `.env.example`: variables esperadas.

## Enlaces
- Flujo de trabajo, setup y gate: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- Índice de docs: [docs/README.md](docs/README.md)
- Backlog: [docs/TASK_TODO.md](docs/TASK_TODO.md)
- Historial: [docs/TASK_COMPLETED/](docs/TASK_COMPLETED/)
- Uso y flujo de prueba: [README.md](README.md)
