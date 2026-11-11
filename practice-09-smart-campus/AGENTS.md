# Project
Smart Campus room availability checker.
One room, fictional booking data, fixed preview scenario.

# Project constraints
- Preserve existing booking behavior.
- Preserve all existing UI components and responsive feedback.
- Do not add a backend, database, login or booking creation.
- Do not invent missing AC5 and AC6 requirements.

# Engineering rules
- Prefer minimal and safe changes.
- Keep canBook.ts as the single source of truth for booking validity.
- Avoid duplicated booking validation logic.
- Do not mutate booking fixtures.
- Avoid unnecessary design patterns and dependencies.
- Preserve existing validation messages and their order.

# Verification
- Run available typecheck and build commands.
- Add regression tests for booking rules.
- Report every changed file and explain why.
- Never claim tests passed without running them.
