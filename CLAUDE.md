# AGENTS.md - Development Guidelines for Bruschi Rentals

## Commands

### Development & Building

- **Dev server**: `pnpm run dev`
- **Build**: `pnpm run build`
- **Preview**: `pnpm run preview`
- **Start production server**: `pnpm run start`

### Code Quality

- **Format code**: `pnpm run format` (uses Prettier with Astro and Tailwind plugins)
- **Type check**: `npx astro check` (runs TypeScript checking with strict mode)

### Testing

- **No testing framework currently configured** - Consider adding Vitest for
  unit/component testing
- **Future test commands** (when implemented):
  - `pnpm run test` - Run all tests
  - `pnpm run test:unit` - Run unit tests only
  - `pnpm run test:watch` - Run tests in watch mode
  - `pnpm run test:coverage` - Generate test coverage report

### Linting

- **No linting tool currently configured** - Consider adding ESLint for code quality
- **Future lint commands** (when implemented):
  - `pnpm run lint` - Check code quality
  - `pnpm run lint:fix` - Auto-fix linting issues

## Code Style Guidelines

### Project Structure

- **Framework**: Astro + React (TypeScript)
- **Package manager**: pnpm
- **UI**: shadcn/ui with Tailwind CSS v4
- **Path aliases**: `@/` → `src/`
- **Adapter**: Node.js (standalone mode)
- **Authentication**: Auth0 with passwordless login (email/SMS)

### File Organization

- **Components**: `src/components/` (`.tsx` for React, `.astro` for Astro)
- **Pages**: `src/pages/` (`.astro` files with file-based routing)
- **Layouts**: `src/layouts/` (`.astro` layout components)
- **Actions**: `src/actions/` (server-side actions using `astro:actions`)
- **Services**: `src/services/` (server utilities, API calls)
- **Utils**: `src/utils/` or `src/lib/` (shared utilities and helpers)
- **Types**: `src/types.ts` (centralized type definitions)
- **Auth**: `src/lib/auth.ts`, `src/lib/auth0.server.ts` (authentication logic)
- **Assets**: `src/assets/` (images, fonts, etc.)
- **Styles**: `src/styles/global.css` (global styles and Tailwind config)

### Naming Conventions

- **Components**: PascalCase (e.g., `FormWizard.tsx`, `LoginForm.tsx`)
- **Files**: kebab-case for pages/layouts (e.g., `form.astro`, `portal.astro`),
  PascalCase for components
- **Directories**: camelCase or kebab-case based on content type
- **Variables/Functions**: camelCase (e.g., `handleSubmit`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`, `RATE_LIMIT_WINDOW`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g.,
  `SubmitPreferencesSchema`, `ClientOption`)
- **Custom Hooks**: camelCase prefixed with `use` (e.g., `useStepCompletion`)

### Import Organization

Import statements should be grouped and ordered as follows:

```typescript
// 1. React imports
import { useState, useEffect } from "react";

// 2. External libraries (alphabetically sorted)
import { toast } from "sonner";
import { z } from "astro/zod";

// 3. Astro imports
import { actions } from "astro:actions";
import type { APIContext } from "astro";

// 4. Internal imports (@/ aliases, alphabetically sorted)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitPreferencesSchema } from "@/types";

// 5. Relative imports (rarely used, prefer @/ aliases)
import { getSession } from "../../lib/auth";
```

### Code Patterns

#### React Components

- **Functional components with hooks**: Always use functional components
- **Props typing**: Use interfaces for component props with descriptive names
- **Event handlers**: Prefix with `handle` (e.g., `handleSubmit`, `handleInputChange`)
- **State variables**: Use descriptive names, consider custom hooks for complex state
- **Effects**: Use `useEffect` sparingly, prefer derived state when possible

```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectUrl }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Implementation
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  );
};
```

#### Astro Components

- **Frontmatter**: Keep concise, import only what's needed
- **Props**: Use TypeScript interfaces for type safety
- **Client directives**: Use sparingly (`client:load`, `client:idle`, etc.)

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<div class="hero">
  <h1>{title}</h1>
  {description && <p>{description}</p>}
</div>
```

#### Actions (Server-side)

- **Input validation**: Always use Zod schemas for input validation
- **Error handling**: Use `ActionError` for user-facing errors
- **Authentication**: Check sessions for protected actions
- **Rate limiting**: Implement rate limiting for sensitive operations
- **Response format**: Return consistent response objects

```typescript
export const server = {
  submitPreferences: defineAction({
    input: SubmitPreferencesSchema,
    handler: async (input, context) => {
      // Rate limiting check
      // Session validation
      // Business logic
      // Error handling with ActionError

      return { success: true };
    },
  }),
};
```

#### Error Handling

- **User-facing errors**: Use `toast.error()` for client-side, `ActionError`
  for server-side
- **Validation errors**: Provide specific, actionable error messages
- **Network errors**: Handle fetch failures gracefully with user feedback
- **Type guards**: Use `instanceof Error` for error type checking
- **Avoid**: Generic "Something went wrong" messages

```typescript
// Client-side error handling
try {
  const result = await actions.submitPreferences(formData);
} catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  toast.error(message);
}

// Server-side error handling
if (!response.ok) {
  if (response.status === 400) {
    throw new ActionError({
      code: "BAD_REQUEST",
      message: "Please check your input and try again.",
    });
  }
  throw new ActionError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Service temporarily unavailable.",
  });
}
```

### Styling & UI

#### Tailwind CSS

- **Utility classes**: Use Tailwind utilities over custom CSS when possible
- **Conditional classes**: Use `cn()` utility for dynamic class application
- **Custom properties**: Defined in `src/styles/global.css` for design tokens
- **Dark mode**: Supported via `.dark` class (CSS variables automatically switch)

#### Design System Colors

```css
--color-obsidian: #261d18; /* Primary text, headings */
--color-soft: hsl(27, 24%, 93%); /* Backgrounds, cards */
--color-mocha: #5d4738; /* Secondary text, muted content */
--color-primary: oklch(58.6% 0.253 17.585); /* CTAs, links */
```

#### shadcn/ui Components

- **Import path**: `@/components/ui/*`
- **Customization**: Modify component variants in their respective files
- **Accessibility**: Components include proper ARIA attributes by default

### TypeScript

#### Configuration

- **Strict mode**: Enabled via `astro/tsconfigs/strict`
- **Path mapping**: `@/*` maps to `./src/*`
- **Module resolution**: Node.js style with path mapping

#### Type Safety

- **Avoid `any`**: Use `unknown` for truly unknown types, or specific unions
- **Zod schemas**: Use for runtime validation and type inference
- **Interface vs Type**: Use interfaces for object shapes, types for unions/primitives
- **Generic constraints**: Use generics thoughtfully for reusable components

```typescript
// Good: Specific types
interface User {
  id: string;
  name: string;
  email?: string;
}

// Good: Zod for validation + type inference
export const SubmitPreferencesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(),
});

// Avoid: any types
// const data: any = fetchSomething(); // Bad

// Better: unknown with type guards
const data: unknown = fetchSomething();
if (typeof data === "string") {
  // Now data is typed as string
}
```

### Security Considerations

#### Authentication & Authorization

- **Session management**: Use `getSession()` and `setSession()` utilities
- **Token refresh**: Automatic token refresh on API calls
- **Rate limiting**: 5 attempts per minute for auth operations
- **Input validation**: All user inputs validated with Zod schemas

#### API Security

- **Environment variables**: Use `astro:env/server` for secrets
- **CORS**: Astro handles CORS automatically
- **HTTPS**: Always use HTTPS in production
- **Secrets**: Never commit API keys or sensitive data

### Environment Variables

Required environment variables (set in `.env`):

- `API_BASE_URL`: Backend API URL
- `AUTH0_DOMAIN`: Auth0 domain
- `AUTH0_CLIENT_ID`: Auth0 client ID
- `AUTH0_CLIENT_SECRET`: Auth0 client secret
- `AUTH0_AUDIENCE`: Auth0 API audience
- `SESSION_SECRET`: Session encryption secret

### Deployment

- **Platform**: Node.js standalone (via `astro build`)
- **Static assets**: Served from `dist/` directory
- **Environment**: Production builds optimized for performance
- **Caching**: Implement appropriate cache headers for static assets

### Commit Messages

- **Format**: `type(scope): description`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Examples**:
  - `feat(auth): add SMS login support`
  - `fix(forms): validate phone number format`
  - `refactor(components): extract reusable form logic`

### Development Workflow

1. **Feature development**: Create branch from `main`
2. **Code changes**: Follow style guidelines and run type checking
3. **Testing**: Manual testing (automated tests to be added)
4. **Code review**: Ensure code follows guidelines
5. **Merge**: Squash merge with descriptive commit message

### Future Improvements

- **Testing**: Add Vitest + Testing Library for component testing
- **Linting**: Add ESLint with React and TypeScript rules
- **CI/CD**: Add GitHub Actions for automated testing and deployment
- **Performance**: Add bundle analysis and optimization
- **Monitoring**: Add error tracking and analytics
