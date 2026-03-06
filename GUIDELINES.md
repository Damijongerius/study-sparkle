# Study Sparkle Engineering Standards

## 1. File Size Limit
- **Max 200 lines per file.**
- If a file exceeds this limit, it must be split into smaller, focused modules.
- This applies to Components, Hooks, Utilities, and Styles.

## 2. Self-Documenting Code
- **Naming over Comments:** Use descriptive names for variables, functions, and components so that comments are unnecessary.
- **Function Names:** Should be verbs (e.g., `calculatePointDeduction` instead of `ptsCalc`).
- **Boolean Names:** Should use prefixes like `is`, `has`, `should`, or `can` (e.g., `isTaskLocked`).
- **No Redundant Comments:** Delete "what" comments (e.g., `// state for points`). Only use "why" comments for rare, extremely complex edge cases.

## 3. Component Architecture
- **Atomicity:** Large components must be broken down into sub-components.
- **Sub-directory pattern:** If a component has many sub-components, create a folder for it (e.g., `components/Agenda/Grid.tsx`).
- **Logic Separation:** Keep UI and logic separate. Complex logic should live in custom hooks.

## 4. Hook Architecture
- **Modular Hooks:** Instead of one massive "God Hook", create domain-specific hooks (e.g., `useStickers`, `usePlanner`, `useNotifications`).
- **Composition:** Compose these domain hooks into a central context if shared state is required.

## 5. Naming Conventions
- **Components:** `PascalCase` (e.g., `StudyTimer.tsx`).
- **Functions/Variables:** `camelCase` (e.g., `handleStartSession`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `DEFAULT_TIME_LIMIT`).
- **Types/Interfaces:** `PascalCase` (e.g., `StudyState`).

## 6. Directory Structure
- `src/components/ui/`: Base primitive components.
- `src/components/shared/`: Reusable complex components.
- `src/features/`: Feature-specific components and logic (for larger refactors).
- `src/hooks/`: Domain-specific custom hooks.
