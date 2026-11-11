# AI-Driven Software Engineering — Practice #06
## Vibe Coding and Prototype Cleanup — Evidence Log

- AI tool: Bolt.new
- Assistant used for running the process and documentation: Claude Code (Claude Opus 5.5)

---

## Task 01 — Define before generating

**User story:** As a student, I want to check a room's availability so that I can choose a valid booking time.

**Scope:** one responsive page for checking one selected room; no login, backend, database, or external API. Fictional room and booking data only. The prototype checks availability; it does not save or confirm a booking.

**Acceptance criteria**
- **AC1:** Accept a candidate interval only when 0 ≤ start < end ≤ 1440 and start is after the supplied current time.
- **AC2:** Reject a booking longer than 120 minutes.
- **AC3:** Reject the request when the selected room is blocked.
- **AC4:** Reject any interval that overlaps an existing booking; touching endpoints are allowed.
- **AC5:** Show a clear Available / Unavailable decision without changing the existing booking data.
- **AC6:** The page remains usable at desktop and narrow/mobile width and gives understandable validation feedback.

Intervals are half-open: `[start, end)` — start included, end excluded.

**Predicted failure points (before generation)**
1. **Touching intervals (AC4).** The AI will likely use `<=` instead of `<` in the overlap check, so a request 660–720 next to an existing 600–660 is wrongly rejected. Correct check: `reqStart < existingEnd && existingStart < reqEnd`.
2. **"Start is after current time" (AC1).** Likely implemented as `start >= now` (so a request starting exactly at `now` is accepted), or the AI may use the real clock instead of a supplied "current time" input, making the case `now=540` impossible to test.
3. *(extra)* **Exactly 120 minutes (AC2)** may be rejected by `>=` instead of `>`; and AC5 may be violated if the "Check" button adds the request to the booking list.

**Initial prompt (Task 01/02)**
> Build a small responsive Smart Campus Room Availability Checker. Requirements: [AC1–AC6 pasted]. Use fictional sample data only. Keep the implementation simple and within one-page scope. Do not add authentication, backend services, analytics, or unrelated features. After building, briefly list the main files/components you created.

---

## Task 02 — Prototype v1
- First generation: build passed, but the preview showed a **blank white page** (dev server "VITE ready", no visible error).
- One focused repair prompt (allowed by Task 02):
  > The dev server starts without errors (Vite ready on localhost:5173), but the preview shows a blank white page. Expected: the Room Availability Checker page renders and works per AC1–AC6. Find the cause (e.g. runtime error, missing render, empty App component) and make the smallest change that fixes it. Do not add features or redesign. Explain which file you changed and why.
- Bolt's fix: `vite.config.ts` — `optimizeDeps.exclude: ['lucide-react']` → `include: ['lucide-react']` (icon library was not pre-bundled in dev mode, causing a runtime failure). No app code changed.
- Result = **v1**: the page renders (room selector, start/end time dropdowns, Check Availability / Reset, existing bookings list, current time reference from system clock).
- Files created by Bolt: `src/lib/rooms.ts` (types, fictional data, `checkAvailability` logic), `src/components/RoomChecker.tsx` (UI), `src/App.tsx` (page layout).

## Task 03 — Tests on v1
Current time in v1 = system clock (≈ 15:03 = 903 min) and cannot be changed.

| Case | Action | Expected | Observed (v1) | Pass? |
|---|---|---|---|---|
| Touching | Existing 600–660; request 660–720 | Available | Unavailable — "Start time must be after the current time." | ✗ |
| Overlap | Existing 600–660; request 630–690 | Unavailable | Unavailable — "Start time must be after the current time." | ✗ (right answer, wrong reason) |
| Blocked | Request 660–720; room blocked | Unavailable | Unavailable — "Start time must be after the current time." | ✗ (right answer, wrong reason) |
| Exactly 2 hours | Request 720–840 | Available | Unavailable — "Start time must be after the current time." | ✗ |
| Over 2 hours | Request 720–841 | Unavailable | Not testable — dropdowns use 15-minute steps, 14:01 (841) cannot be selected | ✗ (not testable) |
| Starts now | now=540; request 540–570 | Unavailable | Unavailable — "Start time must be after the current time." (now could not be set to 540) | ✗ (not testable) |

**Conclusion:** v1 cannot be tested against the required cases: every request is rejected by the current-time rule because the current time is taken from the system clock instead of being supplied.

## Issue log
| Issue | Evidence | Priority | Decision |
|---|---|---|---|
| #1 Current time comes from the system clock and cannot be set (AC1: "supplied current time") | All 6 cases rejected with "Start time must be after the current time" at 15:03 | High | Fix |
| #2 Time dropdowns do not allow an arbitrary minute (needed for 720–841, AC2) | Start/End dropdowns use 15-minute steps; 14:01 (841) cannot be selected | Medium | Fix |
| #3 Sample data does not match test cases (no 10:00–11:00 booking; 12:00–13:00 booking blocks the "Exactly 2 hours" case) | Lecture Hall A-101 bookings: 09:00–10:00, 12:00–13:00 | Medium | **Not needed** — other rooms already fit the tests (see Fix #3) |

## Task 04/05 — Cleanup prompts, AI outputs, retests

### Fix #1 — Current time cannot be set (AC1)

**Prompt:**
> #1 Current time comes from the system clock and cannot be set (AC1: "supplied current time").

**Bolt output:**
> The issue is that AC1 says "supplied current time" — the current time should be user-settable, not locked to the system clock. Let me read the current files and fix this.I'll replace the system-clock-derived current time with a user-settable "Current Time" input, and use that supplied value in the check.Now I need to add the `Clock` icon import back since it's still used in the room info area, and verify the `distinctOptions` variable is defined before the new select that uses it. Let me re-read the file.The `Clock` icon import is now unused since I removed the current-time display bar. Let me remove it and clean up the extra blank lines.Build and typecheck both pass.
>
> The current time is now a user-settable dropdown (defaults to 09:00) instead of being locked to the system clock. The availability check uses this supplied value for the AC1 "start must be after current time" rule, so you can test any scenario regardless of when you run the app. The old read-only time display bar was removed, and the unused clock icon import was cleaned up.

**Files changed:** `src/components/RoomChecker.tsx` (Bolt did not name the file; the changes it lists — Current Time select, removed time display bar and unused `Clock` icon import — are all in this component)

**Retest** (current time = 540 / 09:00; room: Seminar Room B-204, Blocked case: Computer Lab C-310). First repeat: **Starts now**

| Case            | Action                            | Expected    | Observed (after Fix #1)                                                  | Pass? |
| --------------- | --------------------------------- | ----------- | ------------------------------------------------------------------------ | ----- |
| Touching        | Existing 600–660; request 660–720 | Available   | Available                                                                | ✓     |
| Overlap         | Existing 600–660; request 630–690 | Unavailable | Unavailable<br>Overlaps existing booking "Research Group" (10:00–11:00). | ✓     |
| Blocked         | Request 660–720; room blocked     | Unavailable | Unavailable<br>This room is currently blocked and cannot be booked.      | ✓     |
| Exactly 2 hours | Request 720–840                   | Available   | Available                                                                | ✓     |
| Over 2 hours    | Request 720–841                   | Unavailable | Not testable — 14:01 cannot be selected (15-minute steps, Issue #2)      | ✗     |
| Starts now      | now=540; request 540–570          | Unavailable | Unavailable<br>Start time must be after the current time.                | ✓     |

**Decision:** Accepted — Bolt added a "Current Time" selector without other features; Starts now is now tested correctly and 5/6 cases pass. Minor side effect: End Time moved to its own row (cleaned up in Fix #4).

### Fix #2 — Time dropdowns use 15-minute steps (AC2 test)

**Prompt:**
> In the current prototype, Start/End time dropdowns only allow 15-minute steps, so I cannot enter 12:00–14:01 (720–841) to test AC2. Make the smallest change so start and end can be set to any minute (e.g. time inputs with 1-minute step). Do not redesign the page. Preserve AC1–AC6. Explain which file/component you changed and why.

**Bolt output:**
> Let me read the current component to make the minimal change. I'll replace the Start and End time `<select>` dropdowns with `<input type="time">` elements, which allow any 1-minute step. The `labelToMinutes` helper already handles `HH:MM` strings, so no logic changes are needed. The second edit was a no-op (the time options are still used by the Current Time dropdown, so they should stay). […] Build and typecheck both pass.
>
> **File changed:** `src/components/RoomChecker.tsx`
>
> **What changed:** Replaced the Start Time and End Time `<select>` dropdowns (which only offered 15-minute steps) with `<input type="time">` fields. Native time inputs let you pick any minute, so you can now enter values like 12:00–14:01 to test the AC2 max-120-minutes rule. The existing `labelToMinutes` helper already parses `HH:MM` strings, so no logic changes were needed. The Current Time dropdown stays as-is since it's only a reference point for AC1 and 15-minute granularity is sufficient there.

**Files changed:** `src/components/RoomChecker.tsx`

**Retest** (current time = 540 / 09:00; room: Seminar Room B-204, Blocked case: Computer Lab C-310). First repeat: **Over 2 hours**

| Case            | Action                            | Expected    | Observed (after Fix #2)                                                  | Pass? |
| --------------- | --------------------------------- | ----------- | ------------------------------------------------------------------------ | ----- |
| Touching        | Existing 600–660; request 660–720 | Available   | Available                                                                | ✓     |
| Overlap         | Existing 600–660; request 630–690 | Unavailable | Unavailable<br>Overlaps existing booking "Research Group" (10:00–11:00). | ✓     |
| Blocked         | Request 660–720; room blocked     | Unavailable | Unavailable<br>This room is currently blocked and cannot be booked.      | ✓     |
| Exactly 2 hours | Request 720–840                   | Available   | Available                                                                | ✓     |
| Over 2 hours    | Request 720–841                   | Unavailable | Unavailable<br>Booking cannot be longer than 120 minutes.                | ✓     |
| Starts now      | now=540; request 540–570          | Unavailable | Unavailable<br>Start time must be after the current time.                | ✓     |

**Decision:** Accepted — Over 2 hours (720–841) is now testable and correctly rejected; all 6 cases pass, no logic or design changes. Bolt kept the Current Time selector at 15-minute steps, which is enough for AC1.

### Fix #3 — Sample data does not match test cases → NOT NEEDED (no change made)

Lecture Hall A-101 (bookings 09:00–10:00, 12:00–13:00) does not fit the test cases, but after checking all rooms, the existing fictional data already covers every case:

| Room | Existing bookings | Status | Used for |
|---|---|---|---|
| Lecture Hall A-101 — Engineering Block | 09:00–10:00, 12:00–13:00 | Open | — |
| Seminar Room B-204 — Science Wing | 10:00–11:00, 15:00–16:00 | Open | Touching, Overlap, Exactly 2 hours, Over 2 hours, Starts now |
| Computer Lab C-310 — IT Centre | 08:00–09:00 | **Blocked** | Blocked |
| Study Lounge D-105 — Library | 14:00–15:00 | Open | — |

**Decision:** Rejected changing the sample data — Seminar Room B-204 has exactly the 10:00–11:00 booking and a free 12:00–14:01 window, and Computer Lab C-310 is blocked. Changing data would add work without improving correctness.

### Fix #4 — Cleanup: time fields layout (usability, AC6)

**Issue:** After Fix #1 the Current Time, Start Time and End Time fields are laid out unevenly: Current Time and Start Time share a row, End Time sits alone on the next row; Current Time is a dropdown while Start/End are time inputs, so they look different.

**Prompt:**
> Review only the time fields area in src/components/RoomChecker.tsx. Currently Current Time and Start Time are in one row and End Time is alone on the next row, and the three fields have different heights/styles. Make one small cleanup: show the three fields (Current Time, Start Time, End Time) in a single row of equal width on desktop, stacked in one column on narrow/mobile width, with the same height, border and padding. Do not change any logic, labels, validation, or other parts of the page, and do not add features. Preserve AC1–AC6. Explain what you changed.

**Bolt output:**
> The three time fields are inside a `sm:grid-cols-2` grid. Current Time and Start Time fill the two columns of one row; End Time sits alone in the next row. I'll wrap the three time fields in their own `grid-cols-1 sm:grid-cols-3` section, pulling them out of the 2-column grid. The room select and room info card stay in the 2-col grid above; the duration hint stays below. Build and typecheck pass.
>
> **What changed in `src/components/RoomChecker.tsx`:** I moved the three time fields (Current Time, Start Time, End Time) out of the 2-column grid they shared with the room selector, into their own `grid-cols-1 sm:grid-cols-3` grid. On desktop they now sit side by side in a single row at equal width; on mobile they stack vertically. The duration hint moved out of the old grid's `sm:col-span-2` wrapper to sit naturally below the new grid. All three inputs already shared the same border, padding, and height classes — the inconsistent appearance was caused by the layout putting a `<select>` next to an `<input type="time">` in a 2-column grid where the browser renders them at slightly different internal heights. In a 3-column grid with equal width, they align consistently. No logic, labels, or validation were touched.

**Files changed:** `src/components/RoomChecker.tsx` (layout only: time fields moved into their own `grid-cols-1 sm:grid-cols-3` grid)

**Note:** Bolt's claim that the fields now have equal height "because of the 3-column grid" is an explanation, not evidence — verified visually on the final desktop screenshot: equal height — yes.

**Retest** (current time = 540 / 09:00; room: Seminar Room B-204, Blocked case: Computer Lab C-310)

| Case            | Action                            | Expected    | Observed (after Fix #4)                                                  | Pass? |
| --------------- | --------------------------------- | ----------- | ------------------------------------------------------------------------ | ----- |
| Touching        | Existing 600–660; request 660–720 | Available   | Available                                                                | ✓     |
| Overlap         | Existing 600–660; request 630–690 | Unavailable | Unavailable<br>Overlaps existing booking "Research Group" (10:00–11:00). | ✓     |
| Blocked         | Request 660–720; room blocked     | Unavailable | Unavailable<br>This room is currently blocked and cannot be booked.      | ✓     |
| Exactly 2 hours | Request 720–840                   | Available   | Available                                                                | ✓     |
| Over 2 hours    | Request 720–841                   | Unavailable | Unavailable<br>Booking cannot be longer than 120 minutes.                | ✓     |
| Starts now      | now=540; request 540–570          | Unavailable | Unavailable<br>Start time must be after the current time.                | ✓     |

**Decision:** _Accepted - time fields now in one row on desktop and stacked on mobile; layout-only change, 6/6 tests still pass._

### Final check — mobile width (AC6)
- Desktop: ok
- Mobile (device icon in Bolt preview):  ok
- Screenshot saved: yes

## Change log (issue → decision → change → result)
| Issue | Decision | Change | Result |
|---|---|---|---|
| #1 Current time not settable | Accepted | Added a "Current Time" selector (replaces system-clock reference) | Starts now testable; 5/6 cases pass (Over 2 hours blocked by #2) |
| #2 15-minute steps | Accepted | Start/End `<select>` → `<input type="time">` in RoomChecker.tsx | Over 2 hours testable; 6/6 cases pass |
| #3 Sample data mismatch | Rejected (not needed) | None — tests run on Seminar Room B-204 and Computer Lab C-310 | All cases testable without changing data |
| #4 Uneven time fields layout | Accepted | Time fields moved into own `grid-cols-1 sm:grid-cols-3` grid in RoomChecker.tsx | One row on desktop, stacked on mobile; 6/6 cases still pass |

## Code explanation

Explained function: `checkAvailability(room, start, end, currentMinutes)` in `src/lib/rooms.ts`.

**What it does:** it takes the selected room, the requested start and end (in minutes from 00:00, e.g. 10:00 = 600) and the current time, and returns `{ available, reasons }`. It does not stop at the first problem: every acceptance criterion is checked one by one, and each failed check adds a human-readable reason to the `reasons` list. At the end, the room is available only if the list is empty (`reasons.length === 0`). This is why the page can show a clear Available / Unavailable decision together with the exact reason.

**The checks, in order:**
1. **AC1 — valid interval:** `start < 0 || end > 1440 || start >= end` → rejected. The interval must lie inside one day and the end must be after the start.
2. **AC1 — start after current time:** `start <= currentMinutes` → rejected. `<=` means a booking that starts *exactly* now is also rejected ("Starts now" case: 540 ≤ 540).
3. **AC2 — max length:** `end - start > 120` → rejected. Strict `>` means exactly 120 minutes (720–840) is still allowed, but 121 minutes (720–841) is not.
4. **AC3 — blocked room:** `room.blocked` is true → rejected.
5. **AC4 — overlap:** the helper `overlaps(b, start, end)` returns `start < b.end && end > b.start`. Both comparisons are strict, so intervals that only touch are allowed: request 660–720 vs booking 600–660 → `660 < 660` is false → no overlap. Request 630–690 → `630 < 660` and `690 > 600` → overlap → rejected. `find` returns the first conflicting booking, and its title and time are shown in the message.

**AC5 — data is not changed:** the function only reads `room.bookings`; it never adds or edits a booking. The sample data is a constant (`sampleRooms`), so checking availability can never modify existing bookings.

**Helpers:** `minutesToLabel(600)` → `"10:00"` and `labelToMinutes("10:00")` → `600` convert between minutes and the HH:MM format shown in the UI.

### Prediction check (Task 01 predictions vs. reality)
| Prediction | Result |
|---|---|
| Touching intervals rejected by `<=` in overlap check | **Wrong** — Bolt used strict `<` / `>`, touching case passed |
| "Start after current time" wrong / real clock used | **Partly right** — the comparison `start <= currentMinutes` was correct, but v1 used the system clock instead of a supplied time (Issue #1) |
| Exactly 120 minutes rejected by `>=` | **Wrong** — Bolt used `> 120`, the 720–840 case passed |

