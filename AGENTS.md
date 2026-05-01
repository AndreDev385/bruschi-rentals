# Landing AGENTS.md

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

| Action | Descripción | Auth |
|--------|-------------|------|
| `submitPreferences` | Submit form preferences | No |
| `sendLoginCode` | Enviar código por email | No |
| `sendLoginCodeSMS` | Enviar código por SMS | No |
| `toggleFavorite` | Toggle favorito | Session |
| `submitFeedback` | Submit feedback | Session |

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
