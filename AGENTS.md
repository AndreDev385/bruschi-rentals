# Landing AGENTS.md

> **Harness Version**: 1.0
> **Last Updated**: 2026-05-07
> **Stack**: Astro + React (TypeScript), pnpm, Tailwind CSS v4

## Branch Workflow

```
main    ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  ↑                                                                           ↑
  │  [HUMAN ONLY] merge after approval                                        │
  │                                                                           │
stage   ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  ↑
  │  [AGENT] commit directly or via PR to stage
  │
feature/agent-task-123
```

- **Agent target branch**: `stage` always.
- **Human gate**: `main` merges require human operator approval.
- **Emergency override**: If a critical fix is needed on `main`, the agent prepares it on `stage` and explicitly requests human merge with justification.

## Agent Rules (OBLIGATORIO)

1. **Run `./scripts/agent-check.sh fast` before considering a task done**.
2. **Branch Rule — AGENT NEVER MERGES TO MAIN**: All agent work must be committed to the `stage` branch. `main` is protected and requires explicit human approval for any merge.
3. **Conventional commits**: `feat(scope): description`, `fix(scope): description`, `test(scope): ...`
4. **If CI fails**, read the error log, fix the root cause, and rerun `./scripts/agent-check.sh fast`. Do not ask humans until you have tried 3 iterations.

## Comandos Esenciales

```bash
pnpm run dev      # Dev server
pnpm run build    # Production build
pnpm run format   # Format (Prettier)
npx astro check   # TypeScript strict check
```

## Stack

- **Framework**: Astro + React (TypeScript)
- **Package manager**: pnpm
- **UI**: shadcn/ui + Tailwind CSS v4
- **Auth**: Auth0 passwordless (email/SMS)
- **Path aliases**: `@/` → `src/`

## Decisiones de Producto No Obvias

- **Form data persistence**: Los datos del formulario se guardan en localStorage entre steps
- **Origin tracking**: El parámetro `?origin=` de la URL se registra con el lead (default: "Organic")
- **Price range fetch**: Se obtiene automáticamente al completar el step de apartment type
- **Honeypot anti-bot**: Campo `website` oculto en `ContactFormStep`. Si viene preenchido → reject
- **Turnstile**: Widget invisible en el último step del formulario (`PUBLIC_TURNSTILE_SITE_KEY`)

## Acciones (Server-side)

Definidas en `src/actions/index.ts`. Todas validan input con Zod.

| Action              | Descripción             | Auth    |
| ------------------- | ----------------------- | ------- |
| `submitPreferences` | Submit form preferences | No      |
| `sendLoginCode`     | Enviar código por email | No      |
| `sendLoginCodeSMS`  | Enviar código por SMS   | No      |
| `toggleFavorite`    | Toggle favorito         | Session |
| `submitFeedback`    | Submit feedback         | Session |

## Rutas Principales

```
/                      → Landing + form wizard
/login                 → Login email/SMS
/portal               → Dashboard del cliente (auth)
/portal/:id           → Detalle de opción de apartamento
/auth/callback        → Auth0 callback
```

## TypeScript

- **Strict mode**: Activado (`astro/tsconfigs/strict`)
- **Evitar `any`**: Usar `unknown` con type guards
- **Zod schemas**: Para validation + type inference
- **API types**: Centralizados en `src/types.ts`

## Styling

- **Tailwind utilities**: Preferir sobre CSS custom
- **Dynamic classes**: Usar `cn()` utility
- **Dark mode**: Clase `.dark` (variables CSS auto-switch)
- **Colores custom**: Definidos en `src/styles/global.css`
