# Project context for Claude Code

This file gives Claude Code the context it needs to assist effectively.
Read this at the start of every session before doing anything.

---

## Best practices for Expo + React Native

- Use Expo for fast iteration, native APIs, and OTA updates. Keep `expo`, `react`, and `react-native` versions aligned with a supported Expo SDK.
- Prefer **managed workflow** until you need custom native code. That keeps builds simpler and lets Expo handle native compatibility.
- Use **TypeScript strict mode** everywhere: avoid `any`, prefer explicit return types, and type props/interfaces clearly.
- Keep UI logic and layout separate from business logic. Components should render props and callbacks, not own complex data transformations.
- Use `StyleSheet.create` or a styling solution like NativeWind. Avoid ad-hoc inline style objects in production code.
- Keep the app theme centralized. Define colors, typography, and spacing tokens in `constants/` and reuse them across screens and components.
- Modularize aggressively: split large components into smaller reusable pieces, keep hooks in `hooks/`, utilities in `utils/`, and UI primitives in `components/ui/`.
- Favor declarative navigation with Expo Router and use tab/layout files for structure. Avoid deeply nested routing logic inside components.
- Test screen behavior and components with Jest + React Native Testing Library. Keep tests focused on user-visible behavior, not implementation details.
- Keep the project lightweight: avoid unused dependencies and remove code paths that are no longer used.

---

## Modularity rule

- Be modular: split features into small, focused files whenever possible.
- One file should do one main thing: screen layout, custom hook, utility helper, or component wrapper.
- If a screen grows beyond 80–120 lines, break parts into child components or helper functions.
- Reuse shared components for buttons, cards, and text styles instead of copying markup.
- Put business state in stores/hooks, not directly inside UI screen files.

---

## Recommended Expo workflow

1. Run `npx expo start` for development.
2. Use the Expo Go app or a dev client matching your SDK.
3. When you add native packages, install with `expo install` to keep compatible versions.
4. Lock your package versions with `package-lock.json` or `yarn.lock`.
5. Use `eas build` only after the project runs cleanly in Expo.

---

## Recommended folder structure

```
CalisthenicsApp/
├── app/                  ← screens and routing for Expo Router
│   ├── _layout.tsx       ← root layout and providers
│   ├── index.tsx         ← home screen
│   └── welcome.tsx       ← welcome screen
├── components/           ← reusable UI components
│   ├── ui/               ← primitive shared UI pieces
│   └── features/         ← feature-specific component groups
├── hooks/                ← custom React hooks
├── store/                ← Zustand or app state stores
├── constants/            ← theme tokens, spacing, colors
├── utils/                ← helper functions and formatter utilities
├── assets/               ← images, fonts, icons
├── __tests__/            ← unit and component tests
├── app.json              ← Expo app config
├── eas.json              ← EAS build config
├── tsconfig.json         ← TypeScript settings
├── .eslintrc.js          ← lint rules
├── .prettierrc           ← formatting rules
└── CLAUDE.md             ← this file
```

---

## Coding conventions

- Use **functional components** only.
- Prefer **named exports** for reusable components and utilities.
- Keep imports → types → component → styles order inside files.
- Use a central theme instead of hardcoded colors.
- Keep component props minimal and explicit.
- Avoid placing heavy logic inside screen files; move it to hooks, stores, or helpers.
- Favor readable, semantic names over abbreviations.
- Keep layout code and state code separate when possible.

---

## What not to do

- Do not use raw `any` in TypeScript.
- Do not mix app layout logic with data fetching in the same component.
- Do not create giant files with unrelated concerns.
- Do not hardcode values like colors, padding, or font sizes in many places.
- Do not use Expo CLI packages that are not compatible with your SDK.
- Do not skip testing for new components or new screen behavior.
