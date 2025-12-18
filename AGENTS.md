# AGENTS.md - Development Guidelines for Bruschi Rentals

## Commands

- **Dev server**: `pnpm run dev` // don't use this command
- **Build**: `pnpm run build`
- **Format code**: `pnpm run format`
- **Type check**: `npx astro check`

## Code Style Guidelines

### Project Structure

- **Framework**: Astro + React (TypeScript)
- **Package manager**: pnpm
- **UI**: shadcn/ui with Tailwind CSS
- **Path aliases**: `@/` → `src/`

### File Organization

- **Components**: `src/components/` (`.tsx` for React, `.astro` for Astro)
- **Pages**: `src/pages/` (`.astro` files)
- **Utils**: `src/utils/` or `src/lib/`
- **Types**: `src/types.ts`
- **Styles**: `src/styles/global.css`

### Naming Conventions

- **Components**: PascalCase (e.g., `FormWizard.tsx`)
- **Files**: kebab-case for pages (e.g., `form.astro`), PascalCase for components
- **Variables**: camelCase
- **Types**: PascalCase with descriptive names

### Code Patterns

- **React**: Functional components with hooks
- **Imports**: Group by external libs, then internal (@/ aliases)
- **Props**: Use interfaces for component props
- **Styling**: Tailwind classes with `cn()` utility for conditional classes
- **Error handling**: Use `Number.isNaN()` instead of `isNaN()`, `Number.parseInt()` instead of `parseInt()`

### UI Components

- **Base**: shadcn/ui components from `@/components/ui/`
- **Styling**: Follow design system colors (obsidian, soft, mocha, primary)
- **Accessibility**: Use proper ARIA labels and semantic HTML

### TypeScript

- **Strict mode**: Enabled via `astro/tsconfigs/strict`
- **Types**: Define interfaces for complex objects
- **Avoid**: `any` types, prefer `unknown` or specific unions

### Commit Messages

- **Format**: `type(scope): description`
- **Types**: feat, fix, docs, style, refactor, test, chore
