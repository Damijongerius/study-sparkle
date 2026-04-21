---
name: study-sparkle-file-conventions
description: Detailed file structure and function declaration standards for Study Sparkle (100-200 line limit, actual function declarations, bottom-of-file placement).
---

# Study Sparkle File Conventions

## 1. File Size Constraints (TSX)
- **Target Size:** Every React component file (.tsx) must target a size between **100 and 200 lines**.
- **Refactoring Trigger:** If a component exceeds **200 lines**, extract logic or sub-components into new files within the same directory or a relevant subdirectory.
- **Minimum Size:** Avoid extremely fragmented files (e.g., < 20 lines) unless they are highly reusable utility components.
- **Goal:** Maintain high readability by keeping files focused on a single responsibility.

## 2. Function Declaration Style
- **Avoid Arrow Functions:** Do not use arrow functions for top-level component declarations (e.g., `const MyComponent = () => ...`).
- **Use Function Keywords:** Use the `function` keyword for all component definitions (e.g., `function MyComponent() { ... }`).
- **Consistency:** Use arrow functions ONLY for inline event handlers, map/filter callbacks, or small utility functions *within* a component.

## 3. Top-to-Bottom File Organization
To maintain a consistent reading experience across the codebase, files must follow this exact order:

1.  **Imports:** Grouped by external libraries, then project-level utilities (`@/lib`), then local components.
2.  **Types & Interfaces:** Define all `Props` and state-related interfaces here.
3.  **Constants:** Exported constants or configuration objects.
4.  **Helper Functions:** Non-React helper functions that don't depend on component state.
5.  **Sub-Components:** Small, internal helper components used by the main component.
6.  **Main Component:** The primary export must be placed at the **bottom of the file**.

### Example Structure:
```tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TimerProps {
  duration: number;
  onComplete: () => void;
}

const DEFAULT_COLOR = '#ff6b6b';

function calculateProgress(current: number, total: number): number {
  return (current / total) * 100;
}

/** Main Component at the bottom */
export default function StudyTimer(props: TimerProps) {
  const { duration, onComplete } = props;
  const [timeLeft, setTimeLeft] = useState(duration);

  // ... implementation ...

  return (
    <div className="timer-container">
      {/* ... JSX ... */}
    </div>
  );
}
```
