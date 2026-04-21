---
name: study-sparkle-tsx-clean-code
description: TSX and logic readability standards for Study Sparkle (anti-nesting rules, sub-component extraction thresholds, flat structure, logical clarity).
---

# Study Sparkle TSX Clean Code

## 1. Anti-Nesting Rule
- **JSX Threshold:** JSX/HTML nesting should not exceed **3-4 levels**.
- **Refactoring Trigger:** If you find yourself nesting tags deeper than 4 levels (e.g., `div > div > section > ul > li > span`), you **MUST** extract the inner logic into a new sub-component.
- **Goal:** Keep the `return` statement of the main component flat and readable.

## 2. Logic Extraction Thresholds
- **Large JSX Blocks:** If a block of JSX (e.g., a modal content, a complex table row) is more than 30 lines long, extract it into its own component.
- **Conditional Rendering:** Move complex ternary operators or large logical `&&` blocks into helper functions or sub-components.
- **Multi-Indentation Logic:** If your TSX contains more than 2-3 levels of nested conditional logic (e.g., `condition ? (subCondition ? ... : ...) : ...`), you must extract that logic into a separate function or component.

### Refactoring Example (Anti-Nesting):

**❌ Bad (Too Deeply Nested):**
```tsx
return (
  <div className="outer">
    <div className="inner">
      <section className="main">
        <div className="list-container">
          <ul>
            <li>
              <div className="item-content">
                <span>{item.name}</span>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
);
```

**✅ Good (Extracted and Flat):**
```tsx
/** Sub-component extracted at the top of the file */
function ListItem({ name }: { name: string }) {
  return (
    <li className="list-item">
      <span className="item-name">{name}</span>
    </li>
  );
}

/** Main component is now flat and readable */
export default function UserList({ items }) {
  return (
    <div className="page-wrapper">
      <div className="content-area">
        <ul className="user-list">
          {items.map(item => <ListItem key={item.id} name={item.name} />)}
        </ul>
      </div>
    </div>
  );
}
```

## 3. Map/Filter Formatting
- **Anonymous Callbacks:** For `map()` and `filter()`, use simple arrow functions.
- **Complex Logic:** If the callback requires more than 3-5 lines of logic, extract it into a named function or a separate component.
- **Key Prop:** Always ensure the `key` prop is at the top-level of the returned element.

## 4. Logical Operators & Clarity
- **Avoid Nested Ternaries:** Never nest ternary operators. Use `if/else` logic outside the JSX or extract branches into sub-components.
- **Boolean Coercion:** Use `!!` or explicit comparisons (e.g., `items.length > 0 && ...`) to avoid rendering `0` in the UI.
- **Named Components:** Every extracted component, even if local to the file, must have a clear, descriptive name.
