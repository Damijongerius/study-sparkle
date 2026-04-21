---
name: study-sparkle-google-standards
description: Google TypeScript Style Guide compliance for Study Sparkle (ts.dev/style/#identifiers, naming, type safety, documentation).
---

# Study Sparkle Google Standards

## 1. Identifier Naming (ts.dev/style/#identifiers)

### **PascalCase (UpperCamelCase)**
- **Classes, Interfaces, Enums, Types:** Always use `PascalCase`.
- **Interfaces:** Do **NOT** use an `I` prefix (e.g., use `User`, not `IUser`).
- **Enums:** Use `PascalCase` for both the enum name and its values (e.g., `enum Color { Red, Blue }`).
- **React Components:** Always use `PascalCase` for component names, regardless of implementation (function or class).

### **camelCase (lowerCamelCase)**
- **Variables & Parameters:** Always use `camelCase`.
- **Functions & Methods:** Always use `camelCase`.
- **Properties:** Always use `camelCase`.
- **Module Namespace Imports:** Use `camelCase` (e.g., `import * as myUtils from './utils'`).

### **SCREAMING_SNAKE_CASE (UPPER_SNAKE_CASE)**
- **Constants:** Use only for global, immutable constant values or `static readonly` properties (e.g., `const DAYS_IN_WEEK = 7`).
- **Note:** If a value is instantiated multiple times or is mutated, use `camelCase`.

### **General Rules**
- **Characters:** Use only ASCII letters, digits, underscores, and `$`.
- **No Prefixes/Suffixes:** Never use `_` as a prefix or suffix (e.g., no `_privateField`).
- **Acronyms:** Treat acronyms as words (e.g., `loadHttpUrl` instead of `loadHTTPURL`).

## 2. Type Safety & Style
- **Avoid `any`:** Strictly avoid the `any` type. Use `unknown` or define a proper interface.
- **Interfaces vs. Types:** Prefer `interface` for object shapes and `type` for unions/intersections.
- **Null Safety:** Use optional chaining (`?.`) and nullish coalescing (`??`) extensively.
- **Early Returns:** Use early returns to minimize indentation and improve logic flow.

## 3. Documentation (JSDoc)
- **Top-Level:** Every file should have a brief JSDoc explaining its responsibility.
- **Complexity:** Document parameters and return types for non-obvious logic using JSDoc.
- **Props:** Use JSDoc to describe the purpose of each prop in a component's interface.

### Example:
```tsx
/**
 * A reusable button for elite actions.
 */
export function EliteButton({ label, onEliteClick }: Props) {
  // ...
}

interface Props {
  /** The text displayed on the button */
  label: string;
  /** Callback for high-priority user actions */
  onEliteClick: () => void;
}
```

## 4. Architecture
- **Single Responsibility:** Each file/function should have one clear purpose.
- **Immutability:** Use `const` by default. Only use `let` when reassignment is mandatory.
- **Imports:** Always use absolute path aliases (e.g., `@/components/...`) to avoid deep relative paths.
