# Shared Components

This directory contains **shared/reusable UI components** that are used across multiple features.

## Purpose

- **NOT for feature-specific components** (those go in `features/[feature-name]/components/`)
- **ONLY for truly shared components** used in 2+ features

## Examples of Shared Components

Components that belong here:

```
components/
├── ui/                    # Generic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   └── Dropdown.tsx
├── layout/               # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
└── common/              # Common utilities
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    └── EmptyState.tsx
```

## Usage

```tsx
// In any feature or page
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function MyComponent() {
  return (
    <Modal>
      <Button>Click me</Button>
    </Modal>
  );
}
```

## Guidelines

### DO ✅
- Create truly reusable components here
- Use generic prop names
- Make components flexible and composable
- Document component APIs
- Export from `index.ts` for clean imports

### DON'T ❌
- Put feature-specific logic here
- Couple to specific features
- Create one-off components
- Mix business logic with UI

## When to Use

**Use `components/` when:**
- Component is used in 2+ features
- Component is generic (Button, Input, Modal)
- Component is a layout element (Header, Footer)

**Use `features/[feature]/components/` when:**
- Component is specific to one feature
- Component contains business logic
- Component is not reused elsewhere

## Current State

📝 Currently empty - add shared components as needed

As features are built, extract common patterns into shared components.

## Example Component Structure

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children,
  onClick 
}: ButtonProps) {
  return (
    <button className={`btn-${variant} btn-${size}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

## Barrel Exports

Create `index.ts` files for clean imports:

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
```

Then import like:
```typescript
import { Button, Input, Modal } from '@/components/ui';
```

---

**Rule of thumb:** If you're not sure where a component belongs, start in the feature directory. Extract to shared components only when it's actually reused.

