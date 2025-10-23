# Frontend Guideline Document

This document explains how our frontend is built, why we made certain choices, and how everything fits together. It’s written in everyday language, so you don’t need a deep technical background to follow along.

## 1. Frontend Architecture

### 1.1 Overall Structure
- **Framework:** We use Next.js (App Router) with React. This gives us both server-rendered pages and dynamic client-side interactions in one framework.  
- **Language:** TypeScript everywhere, for clear types and fewer runtime errors.  
- **Styling:** Tailwind CSS (v4) for utility-first styling.  
- **UI Library:** shadcn/ui for ready-made, customizable React components (cards, tables, buttons, forms, toasts).  
- **Theming:** next-themes to toggle between light and dark modes.  
- **Icons:** Lucide React for a consistent set of SVG icons.  

### 1.2 Why This Architecture Works
- **Scalability:** Next.js’s file-based routing and component-based structure let us split work into small, reusable pieces. Adding new pages or components is straightforward.  
- **Maintainability:** TypeScript plus clear folder conventions (e.g., `app/`, `components/`, `lib/`) keeps code organized. Everyone knows where to look for a page, a shared component, or a helper function.  
- **Performance:** Server-side rendering (SSR) and static generation (SSG) are built in. Code is automatically split per page, so users only download what they need. Tailwind’s tree-shaking removes unused CSS.

## 2. Design Principles

### 2.1 Usability
- We aim for clear labels, intuitive layouts, and familiar UI patterns.  
- Buttons and form controls are grouped logically, with sufficient spacing and focus outlines for keyboard users.

### 2.2 Accessibility
- All interactive elements have proper ARIA attributes and visible focus states.  
- We ensure color contrast meets WCAG AA standards.  
- Semantic HTML (e.g., `<header>`, `<nav>`, `<main>`, `<button>`, `<table>`) is our default.

### 2.3 Responsiveness
- The layout adapts seamlessly from mobile to desktop using Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`).  
- Breakpoints are chosen to match common device widths, ensuring forms and tables remain easy to use on small screens.

## 3. Styling and Theming

### 3.1 Styling Approach
- **Utility-First (Tailwind CSS):** We build designs by composing small utility classes, avoiding large global CSS files.  
- **No Additional CSS Methodology:** Tailwind’s conventions replace BEM or SMACSS.

### 3.2 Theming
- **Light & Dark Modes:** Managed via `next-themes`. Preference is stored in local storage.  
- **Consistent Look:** All components from shadcn/ui respect the theme switch.

### 3.3 Visual Style
- **Overall Style:** Modern flat design with subtle glassmorphism touches on cards (slightly blurred backgrounds with soft shadows).  
- **Font:** Inter (system-ui fallback). Simple, clean, highly readable.

### 3.4 Color Palette
| Role          | Light Mode     | Dark Mode      |
| ------------- | -------------- | -------------- |
| Background    | #F9FAFB        | #111827        |
| Surface       | #FFFFFF        | #1F2937        |
| Primary       | #4F46E5        | #6366F1        |
| Secondary     | #22D3EE        | #5EEAD4        |
| Accent/Error  | #F43F5E        | #F87171        |
| Text Primary  | #1F2937        | #F3F4F6        |
| Text Secondary| #4B5563        | #D1D5DB        |

## 4. Component Structure

### 4.1 Folder Organization
- **app/** – Next.js pages and layouts (server and client components).  
- **components/ui/** – Shared UI primitives (buttons, inputs) from shadcn/ui.  
- **components/feature/** – Feature-specific components (e.g., `DomainTable`, `InboxList`).

### 4.2 Reusability
- Each component is self-contained: it owns its markup, styles (via Tailwind classes), and minimal logic.  
- Props are strictly typed to encourage predictable usage.  
- Utility components (e.g., `Card`, `Modal`) live in `components/ui` and can be themed globally.

### 4.3 Benefits of Component-Based Design
- **Maintainability:** Fixing a bug in one component updates all its uses.  
- **Testability:** Components can be tested in isolation.  
- **Collaboration:** Designers and developers can collaborate on individual components without stepping on each other’s toes.

## 5. State Management

- **Built-in React State:** We use `useState`, `useReducer` for local component state (e.g., form inputs, toggles).  
- **Context API:** `next-themes` uses React Context under the hood for theme.  
- **Server-Side Data:** Next.js server components fetch data directly; results are passed as props to client components.  

For more complex data caching or real-time updates, you can introduce a library like React Query or SWR. However, the built-in patterns suffice for most flows here.

## 6. Routing and Navigation

### 6.1 Next.js App Router
- **File-Based Routing:** Any folder or file under `app/` becomes a route.  
- **Nested Layouts:** Shared UI (headers, sidebars) live in `layout.tsx` files. Each nested route inherits its parent’s layout automatically.

### 6.2 Dynamic Routes
- Example: `app/(dashboard)/inbox/[emailId]/page.tsx` displays an individual email.  
- Parameters (`emailId`) are available via the page’s props.

### 6.3 Links and Navigation
- Use `next/link` for client-side transitions.  
- Active links can be styled with Tailwind’s `aria-current` support.

## 7. Performance Optimization

- **Automatic Code Splitting:** Next.js only bundles code that’s needed per page.  
- **Lazy Loading:** Heavy components (e.g., rich-text editors) can be dynamically imported with `next/dynamic`.  
- **Asset Optimization:** Images served via Next.js `<Image>` component are optimized and lazy-loaded by default.  
- **Tailwind Purge:** Unused CSS classes are removed during the build, keeping CSS bundles small.

These measures ensure fast initial loads and smooth interactions.

## 8. Testing and Quality Assurance

### 8.1 Unit & Integration Tests
- **Jest + React Testing Library:** Test individual components and their interactions.  
- **Vitest (Optional):** A faster alternative to Jest with similar APIs.

### 8.2 End-to-End (E2E) Tests
- **Playwright or Cypress:** Simulate real user flows—sign up, add a domain, view an email—against a local or staging environment.

### 8.3 Linters and Formatters
- **ESLint + Prettier:** Enforce code style and catch common mistakes.  
- **TypeScript Compiler:** Provides an additional layer of type-safety checks.

## 9. Conclusion and Overall Frontend Summary

We’ve chosen a stack that balances developer happiness, performance, and user delight:
- **Next.js + TypeScript** for a unified, type-safe full-stack experience.  
- **Tailwind + shadcn/ui** for rapid, consistent UI development.  
- **Component-based patterns** to keep code organized and maintainable.  
- **Built-in optimizations and testing tools** to ensure reliability and speed.

Together, these guidelines lay a clear path for building and scaling our email-alias SaaS interface. Whether you’re adding new pages, tweaking the theme, or writing tests, you now have a shared language and structure to guide your work.

Happy coding!