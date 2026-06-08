# EduDash Performance Discipline & Scalable Architecture

This document outlines the architectural rules and performance standards for the EduDash ERP project (Phase 2 and beyond). These rules are designed to prevent performance degradation as the Teacher and Admin portals expand.

---

## 1. Routing & Code Splitting
- **Mandatory Lazy Loading**: Every major page or portal MUST be lazily loaded via `React.lazy()` and `Suspense`. 
- **Isolated Chunks**: Ensure that feature-specific data (e.g., Finance data vs. Academic data) is only imported within its respective chunk.
- **App.jsx Discipline**: Keep `App.jsx` lightweight. Do not import heavy business logic or complex components directly into the main entry point.

## 2. Component Design Standards
- **Memoization Strategy**:
  - Heavy cards (LMS, Fee, Timetable) MUST be wrapped in `React.memo`.
  - Expensive calculations inside components MUST be wrapped in `useMemo`.
  - Stable callback functions passed as props MUST be wrapped in `useCallback`.
- **CSS-Driven UI**:
  - Favor CSS transitions and transforms over Framer Motion `layout` animations for simple visibility toggles.
  - Avoid `AnimatePresence` for components that don't strictly require exit animations if it causes race conditions (see `HelperPopup` architecture).
- **DOM Lightweightness**:
  - Popups and Modals must follow the "Always-mounted + CSS visibility" pattern or be lazy-mounted to keep the initial DOM tree small.

## 3. Loading & CLS (Layout Shift) Prevention
- **Reserved Space**: Always define a minimum height or use `SkeletonCard` for sections that load data asynchronously.
- **Structured Skeletons**: Use the themed `SkeletonCard.jsx` instead of generic spinners to provide a better perceived performance and visual stability.
- **Fixed Dimensions**: For dashboard grid items, ensure the layout is predictable during loading to prevent shifting nearby content.

## 4. Dependency Hygiene
- **Specific Imports**: Never use `import *`. Always destructure specific components or utilities (e.g., `import { Bell } from "lucide-react"`).
- **Weight Audit**: Before adding a new library, evaluate its bundle size impact. Favor native browser APIs or lightweight alternatives.
- **Pure Utilities**: Keep data processing utilities in `src/utils` as pure functions to allow for efficient tree-shaking and testing.

## 5. State & Context Management
- **Lightweight Providers**: Context providers should only hold state that is strictly global. Local UI state should stay within the component or its immediate parent.
- **Value Stability**: Always memoize the `value` object provided to `Context.Provider` to prevent unnecessary rerenders of all consumers.
- **Selector Patterns**: If context grows large, consider splitting it into smaller, specialized contexts (e.g., `AuthContext` vs. `TranslationContext`).

## 6. Asset Optimization
- **Vector Icons**: Use SVGs or Icon libraries (Lucide) instead of PNG/JPG icons.
- **CSS Gradients**: Favor CSS gradients over background images for banners and UI accents.
- **Modern Formats**: If images are required, use `.webp` and provide appropriate dimensions.

---

*By following these guidelines, EduDash will maintain its enterprise-grade responsiveness regardless of the number of features added.*
