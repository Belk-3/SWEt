# Smart Campus Room Availability Checker

A small React + TypeScript web app that checks whether a campus study room can be booked for a given time slot.
Built for the **CSCI2208 Software Engineering** course at KBTU (Fall 2026) as an exercise in AI-assisted development,
refactoring and regression testing: a prototype generated with Bolt.new was extended, split into modules and covered with tests.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Vitest

## What's inside

| Folder | What it is |
| --- | --- |
| `initial/project` | The original Bolt.new prototype (Assignment #03), unchanged |
| `final` | Extended and refactored version (Assignment #04) |
| `evidence` | Recorded test runs: baseline vs. final (32 tests passing) |

All data is fictional. There is no login, payment, live API or database.

## Requirements

Node.js 24 and npm 11 were used.

## Setup and run

```bash
cd final
npm install
npm run dev
```

## Test commands

```bash
npm test
npm run test:baseline
npm run typecheck
npm run lint
npm run build
```

`npm run test:baseline` runs the same AC1-AC5 regression file against
`initial/project/src/lib/canBook.ts`. Recorded output is in `evidence/`.

## Final structure

| Path | Responsibility |
| --- | --- |
| `final/src/data/rooms.ts` | Fictional room catalog |
| `final/src/rules/time.ts` | Time parsing and formatting |
| `final/src/rules/availability.ts` | AC1-AC4 rules and form-input feedback |
| `final/src/filtering/roomFilter.ts` | F1 and F2 filtering, attendee parsing |
| `final/src/ui/*` | Presentation components |
| `final/src/App.tsx` | State and composition |
