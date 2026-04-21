---
name: study-sparkle-component-strategy
description: Strategy for building reusable, DRY components in Study Sparkle (CDD, template-driven design, primitive UI extraction).
---

# Study Sparkle Component Strategy

## 1. Component-Driven Development (CDD)
- **Bottom-Up Design:** Start by building small, independent components before assembling them into complex pages.
- **Isolation:** Components should be self-contained and easily testable in isolation.
- **Discovery:** Before creating a new component, search `src/components/ui` or `src/components/shared` to see if a similar primitive already exists.

## 2. DRY (Don't Repeat Yourself) Principles
- **Style Reusability:** If you find yourself applying the same sets of Tailwind classes to multiple elements, extract them into a reusable component or a shared utility class.
- **Logic Extraction:** Move shared state logic into custom hooks (`src/hooks`) or context providers.
- **Button Patterns:** Instead of creating unique button styles repeatedly, extend the base `Button` component or create a specific template (e.g., `EliteButton`, `CuteButton`) that can be reused project-wide.

## 3. Template-Driven Design
- **Consistent Props:** Follow standard naming for props (e.g., `onAction` instead of `triggerFunction`).
- **Flexible Defaults:** Provide sensible defaults for props to ensure components are easy to drop in without heavy configuration.
- **Slot Pattern:** Use the "Slot" pattern (e.g., `children` or named slots) to allow components to be flexible while maintaining their layout.

### Reusable Pattern Example:
```tsx
/** Template: src/components/shared/EliteCard.tsx */
import React from 'react';

interface EliteCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function EliteCard(props: EliteCardProps) {
  const { title, icon, children, className } = props;
  
  return (
    <div className={`p-4 rounded-xl border shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}
```

## 4. Extraction Rule
- If you use the same component logic or visual pattern **3 or more times**, it **MUST** be extracted into a shared component.
- Prioritize extracting "dumb" (presentational) components from "smart" (container/data-fetching) components.
