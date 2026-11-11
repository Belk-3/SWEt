# Software Engineering — course work

Practices and assignments from the **CSCI2208 Software Engineering** course (KBTU, Fall 2026).
The course is about AI-assisted development: defining requirements first, generating prototypes with AI tools
(Bolt.new, Claude), and then checking, refactoring and testing what the AI produced.

Most of the work revolves around one running example — a **Smart Campus Room Availability Checker**:
a page that tells a student whether a study room can be booked for a given time slot
(no overlaps with existing bookings, max 120 minutes, not in the past, room not blocked).

**Stack:** TypeScript · React · Vite · Tailwind CSS · Vitest · Python (unittest) · PlantUML

## Contents

| Folder | Topic | What's inside |
| --- | --- | --- |
| [`practice-04-uml`](practice-04-uml) | UML modeling | Use case, class and sequence diagrams for the room booking system (PlantUML + PNG) |
| [`assignment-02-uml`](assignment-02-uml) | AI-assisted UML | Class and sequence diagrams for a university course registration system |
| [`practice-06-vibe-coding`](practice-06-vibe-coding) | Vibe coding | Evidence log: user story and acceptance criteria written first, then a Bolt.new prototype and its cleanup |
| [`practice-07-testing-ai-code`](practice-07-testing-ai-code) | Testing AI-generated code | First vs. improved Vitest suite, mutation testing results, UI screenshots |
| [`assignment-03-ai-prototype`](assignment-03-ai-prototype) | AI prototype + tests | Booking rules in Python (v1 → final, 23 unit tests) and the Bolt.new prototype before/after fixes, with screenshots |
| [`practice-09-smart-campus`](practice-09-smart-campus) | Minimal refactoring | Bolt.new project with the booking logic extracted into `src/lib` and covered by tests |
| [`assignment-04-smart-campus`](assignment-04-smart-campus) | Extend & refactor | Final version: room finder, filters, modular structure, 32 passing tests vs. the original prototype |

## Running a project

Each React project is a standard Vite app:

```bash
cd assignment-04-smart-campus/final
npm install
npm run dev     # start the app
npm test        # run the tests
```

The Python part:

```bash
cd assignment-03-ai-prototype/python
python -m unittest test_booking.py
```

All room and booking data in these projects is fictional.
