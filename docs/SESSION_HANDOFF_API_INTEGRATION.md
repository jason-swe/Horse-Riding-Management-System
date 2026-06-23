# Frontend API Integration — Session Handoff

> Updated: 2026-06-22  
> Workspace: `D:\WDP`  
> Primary scope: `horse-racing-frontend`  
> Backend is reference-only unless the user explicitly authorizes backend changes.

## Goal

Continue replacing mock/fallback frontend data with the APIs that currently exist in the backend. Follow actual backend code instead of assuming backend Markdown documentation is current.

## Working rules

- Make changes in `horse-racing-frontend` by default.
- Do not edit `horse-racing-backend` without explicit permission.
- Inspect the real backend routes, controllers, validators, and response shapes before integrating an endpoint.
- Preserve the existing green, cream, and orange visual system and responsive behavior.
- Do not remove working UI sections merely because their API is not ready; show a deliberate unavailable/empty state when necessary.
- Avoid silently displaying mock business data as if it were live data.
- After each integration, run the relevant frontend lint/build/tests and verify the affected flow.

## Current integration status

### Phase 1 completed (2026-06-22)

- Added Referee `startRace(id)` and `completeRace(id)` API calls.
- Added authoritative lifecycle controls to race detail and race monitor.
- Actions follow the backend status contract: `scheduled` -> `running` -> `completed`.
- Start is disabled client-side when the race date is missing/future, participants are unavailable, or no approved participants are returned; backend validation remains authoritative.
- Race data refreshes after a successful action. Loading, invalid-state, and assigned-referee authorization errors are surfaced in the UI.
- A `403 Forbidden` response no longer clears the frontend session; only `401 Unauthorized` invalidates authentication.
- Removed incorrect copy claiming Referees have no lifecycle controls. Pause and stop remain explicitly unavailable.
- Frontend production build passed. No lint or test script is defined in `package.json`.

Changed files:

- `src/api/refereeApi.js`
- `src/api/client.js`
- `src/Referee/RaceLifecycleControls.jsx`
- `src/Referee/RefereeRaceDetail.jsx`
- `src/Referee/RaceMonitor.jsx`
- `src/Referee/RefereeLayout.jsx`

### Phase 2 completed (2026-06-22)

- Added Referee API calls for authoritative result participants, readiness, finalize, and apply-penalties.
- Replaced the legacy per-result manual entry screen with the backend race-level workflow.
- The result screen now shows all readiness gates returned by the backend: race/date state, registration lock, eligible participants, submitted report, post-race checks, investigations, and unresolved violations.
- Added an authoritative participant eligibility table with backend blocker reasons.
- Finalize is enabled only when readiness is true and no result draft exists; the backend race engine generates the draft.
- Apply-penalties is enabled for mutable draft results and refreshes the race data afterward.
- Result adapters now preserve raw and final positions, times, scores, and applied violation IDs.
- The result table displays raw versus penalty-adjusted values and locks Referee actions after Admin confirmation/publication.
- Loading, authorization, invalid-state, and retry feedback are handled in the workflow UI.
- Frontend production build and `git diff --check` passed. No lint or test script is defined in `package.json`.

Phase 2 changed files:

- `src/api/refereeApi.js`
- `src/Referee/refereeAdapters.js`
- `src/Referee/RaceResult.jsx`

### Phase 3 completed (2026-06-22)

- Connected the Admin Results module to live `GET /api/race-results` data and grouped result rows by race.
- Added Admin race-level `confirm` and `publish` API calls.
- Enforced the backend transition order in the UI: Draft exposes Confirm, Confirmed exposes Publish, and Published is read only.
- Removed the old combined `Confirm & publish` action so the two backend transactions remain explicit.
- Admin result detail now shows the live race, tournament, round, leader, finish time, applied violations, status, and transition timestamps.
- Confirm/publish refreshes the live result board after success and surfaces authorization or invalid-state API errors.
- Removed create/edit/delete controls and all sample result rows/metrics/tools from the live Results module.
- When the Results API fails, the module shows an explicit error and no sample business data.
- Frontend production build and `git diff --check` passed. No lint or test script is defined in `package.json`.

Phase 3 changed files:

- `src/api/adminApi.js`
- `src/Admin/adminApiAdapters.js`
- `src/Admin/useAdminModuleApi.js`
- `src/Admin/AdminModulePage.jsx`
- `src/Admin/adminModules.js`

### Phase 4 completed (2026-06-22)

- Connected Referee violation options, penalty preview, detail, confirm, and dismiss APIs.
- Violation type and severity choices now come from the backend `/violations/options` contract.
- Removed manual Referee penalty selection and the invalid string `penalty` create payload; the backend policy is authoritative.
- Added debounced penalty preview with policy version, suggested penalty details, and `requires_review` messaging.
- New review-required incidents are recorded as `under_review`; Referees cannot confirm or dismiss violation types reserved for Admin review.
- Added live violation detail with subject, severity, status, time marker, evidence decision context, and policy penalty.
- Confirm and dismiss require a decision note and are shown only for unresolved violations within Referee authority.
- New, edit, confirm, and dismiss controls are locked after race results are confirmed or published, matching the backend 409 rule.
- Existing unresolved violation editing remains available for backend-supported fields only; type and subject are immutable.
- Updated Referee report rendering for the structured backend penalty object.
- Added responsive policy preview, decision, summary, and row-action styling to the scoped Referee stylesheet.
- Frontend production build and `git diff --check` passed. No lint or test script is defined in `package.json`.

Phase 4 changed files:

- `src/api/refereeApi.js`
- `src/Referee/refereeAdapters.js`
- `src/Referee/ViolationManagement.jsx`
- `src/Referee/RaceReport.jsx`
- `src/Referee/refereeConstants.js`
- `src/Referee/referee.css`

### Phase 5 completed (2026-06-22)

- Connected Admin Tournament Setup to live tournament and round list/create/update/delete APIs.
- Connected Admin Race Schedule to live race CRUD plus live tournament/round relationship data.
- Replaced the sample Tournament and Schedule workspaces with a dedicated API-backed competition manager.
- Added required-field validation, tournament/round relationship validation, date-range validation, numeric race fields, loading, refresh, empty, success, and API error states.
- Soft-deleted records are excluded after refresh; destructive actions require confirmation and remain backend-authoritative.
- Race scheduling filters the round selector by its selected tournament and preserves the backend registration-lock calculation by sending only `race_date`.
- Referee assignment is explicitly unavailable in the race form because Admin has no live referee-directory endpoint that can safely supply `RaceReferee` profile IDs.
- Preserved the existing Admin visual system and added responsive table actions and two-column forms.
- Frontend production build and `git diff --check` passed. No lint or test script is defined in `package.json`.
- Backend was inspected as a read-only API contract and was not modified.

Phase 5 changed files:

- `src/api/adminApi.js`
- `src/Admin/AdminCompetitionModule.jsx`
- `src/Admin/AdminModulePage.jsx`
- `src/App.css`

### Phase 6 completed (2026-06-22)

- Removed silent Spectator tournament-list, tournament-detail, and race-schedule fallbacks to `tournamentData`.
- Empty live collections now remain empty; API failures clear stale business data and show explicit error/retry states instead of sample records.
- Tournament and race adapters no longer borrow mock names, locations, prize pools, track surfaces, distances, entry counts, dates, or IDs when backend fields are absent.
- Kept a local horse image only as presentation artwork; unavailable backend business fields are labelled as not published or unavailable.
- Tournament detail preserves live tournament data when only the race-schedule request fails, while clearly reporting that no sample schedule was substituted.
- Published results now use final backend position/time/score values and derive all summary metrics from live published rows.
- Removed static result metrics and sample betting-history rows. Betting history now shows a deliberate unavailable state because no betting/history API is mounted.
- Participant fixtures remain isolated and explicitly labelled as a prototype because the backend has no spectator-safe participant endpoint.
- Frontend production build and `git diff --check` passed. No lint or test script is defined in `package.json`.
- Browser visual verification was attempted but the integrated browser could not initialize because the session runtime omitted required sandbox metadata.
- Backend was inspected as a read-only API contract and was not modified.

Phase 6 changed files:

- `src/pages/spectator/useSpectatorData.js`
- `src/pages/spectator/spectatorAdapters.js`
- `src/pages/spectator/TournamentList.jsx`
- `src/pages/spectator/TournamentDetail.jsx`
- `src/pages/spectator/RaceDetail.jsx`
- `src/pages/spectator/Results.jsx`
- `src/pages/spectator/Leaderboard.jsx`
- `src/pages/spectator/spectator.css`

### Phase 7 completed (2026-06-22)

- Removed all hard-coded horse and jockey ranking records from the Spectator Leaderboard.
- Horse rankings are now derived only from published `/api/race-results` rows and are explicitly labelled as an overall, cross-tournament form board.
- Removed invented owner, rating, prize-money, experience, signal, and tournament-scoping claims from derived rankings.
- Horse ranking fields are limited to facts supported by published rows: wins, starts, win rate, final score, and latest published jockey.
- Replaced the mock jockey leaderboard with a deliberate unavailable state because the backend does not provide the profile, experience, rating, or aggregate scope required by that screen.
- Removed mock tournament context from the leaderboard because the result list is not filtered or grouped by the selected tournament.
- Kept the race participant/viewer fixture isolated, but changed all `Approved`, `Live`, `Official`, and `confirmed` claims to explicit prototype/simulation language.
- Betting fixtures remain untouched inside the dedicated prediction prototype, per the no-backend-contract boundary.
- Frontend production build and `git diff --check` passed. No lint or test script is defined in `package.json`.
- Browser visual verification was attempted, but the integrated browser still could not initialize because the session runtime omitted required sandbox metadata.
- Backend was inspected as a read-only API contract and was not modified.

Phase 7 changed files:

- `src/pages/spectator/Leaderboard.jsx`
- `src/pages/spectator/RaceDetail.jsx`
- `src/pages/spectator/spectatorAdapters.js`
- `src/pages/spectator/spectator.css`

### Phase 8 completed (2026-06-23)

- Removed silent Horse Owner registration fallbacks for horses, tournaments, and registration rows.
- Removed the silent Horse Owner jockey-board fallback and kept jockey cards backed only by `GET /api/horse-owner/jockeys`.
- Owner registration and jockey workflows now show explicit API error, unavailable, and empty states instead of sample business records.
- Horse detail registration history now adapts the live approval-status registration payload instead of filtering `ownerData.js` fixtures.
- Owner dashboard registration counts, queue rows, and available-jockey metrics now use live collections. The jockey metric was renamed to match the available-jockey backend contract instead of implying assignment aggregation.
- Production build and targeted `git diff --check` passed. No lint or test script is defined in `package.json`.
- Authenticated Chrome QA passed for `/owner/registrations`, `/owner/jockeys`, and `/owner` using the seeded Horse Owner account. Live data rendered and the checked pages produced no browser console warnings or errors.
- Backend routes and services were inspected as a read-only API contract and were not modified.

Phase 8 changed files:

- `src/pages/owner/OwnerDashboard.jsx`
- `src/pages/owner/OwnerPages.jsx`
- `src/pages/owner/ownerAdapters.js`
- `src/pages/owner/owner.css`

### Phase 9 completed (2026-06-23)

- Removed the remaining Owner business-fixture imports from the dashboard, layout, horse detail, schedule, results, and profile screens.
- Deleted the now-unused `src/pages/owner/ownerData.js` fixture module.
- Owner schedule rows now derive from the authenticated owner's live registration payload, including populated race date, location, round, tournament, horse, and registration state.
- Removed static owner earnings, win rate, season, result, notification, schedule, and profile fallback values. Unsupported data now uses explicit unavailable states.
- Horse detail schedule now derives from that horse's live approval-status registrations. Horse artwork fallback selection is deterministic presentation data and no longer depends on sample horse records.
- Confirmed from backend code that `GET /api/race-results` excludes the Horse Owner role and that no owner notification or prize-aggregate endpoint exists. Results, prizes, notifications, and notification preferences therefore remain unavailable instead of rendering fixtures.
- Production build and targeted `git diff --check` passed. No lint or test script is defined in `package.json`.
- Authenticated Chrome QA passed at desktop width for `/owner`, `/owner/schedule`, `/owner/results`, and `/owner/profile`. All routes rendered their expected live or unavailable states without horizontal overflow or browser console errors.
- Backend routes and services were inspected as a read-only API contract and were not modified.

Phase 9 changed files:

- `src/pages/owner/OwnerDashboard.jsx`
- `src/pages/owner/OwnerLayout.jsx`
- `src/pages/owner/OwnerPages.jsx`
- `src/pages/owner/ownerAdapters.js`
- `src/pages/owner/ownerData.js` (deleted)

### Mostly connected

- Authentication: roles, login, registration, OTP verification/resend, forgot/reset/change password, current user and logout.
- Role applications and admin role-application review.
- Admin users and race-registration approval.
- Horse owner profile, horses, jockey discovery, registrations and jockey assignments.
- Jockey profile, assignments, schedule, results, statistics and violations.
- Referee basic reads/writes: assigned races, participants, legacy result CRUD, violations CRUD, horse checks and referee reports.
- Spectator basic tournament, race and published result reads.

### Backend APIs that exist but are not fully connected

#### Referee race lifecycle

- `POST /api/races/:id/start`
- `POST /api/races/:id/complete`

The frontend currently claims all lifecycle controls are unavailable. Update the UI to support only the operations the backend really exposes; do not invent pause/stop controls.

#### Race-result workflow

- `GET /api/race-results/races/:raceId/participants`
- `GET /api/race-results/races/:raceId/readiness`
- `POST /api/race-results/races/:raceId/finalize`
- `POST /api/race-results/races/:raceId/apply-penalties`
- `POST /api/race-results/races/:raceId/confirm` — Admin only
- `POST /api/race-results/races/:raceId/publish` — Admin only

The Referee frontend currently uses legacy create/update-per-result calls. It needs to adopt the authoritative race-level workflow. Admin needs confirm/publish actions.

#### Violation workflow

- `GET /api/violations/options`
- `POST /api/violations/penalty-preview`
- `GET /api/violations/:id`
- `POST /api/violations/:id/confirm`
- `POST /api/violations/:id/dismiss`

Frontend currently covers list/create/update only.

#### Admin management

Backend provides CRUD APIs for:

- `/api/tournaments`
- `/api/rounds`
- `/api/races`

Admin `users`, `registrations`, `results`, `tournament`, and `schedule/race` now load live data. Horses, jockeys, referees, and predictions still rely on sample module data or incomplete composition.

#### Spectator-specific routes

These routes are mounted under `/users`, outside the frontend client's normal `/api` prefix:

- `GET /users/spectator/tournaments/:tournamentId`
- `GET /users/spectator/race-schedule`
- `GET /users/spectator/races/:raceId/results`

Decide whether the frontend client should support the `/users` base or whether existing `/api/tournaments`, `/api/races` and `/api/race-results` calls are sufficient. Do not change backend routing without authorization.

## Frontend features whose backend API does not yet exist

- Betting markets and odds.
- Wallet/balance.
- Submit bet and bet history.
- Market lock, settlement and rewards.
- Realtime race transport/socket and authoritative race script.
- Pause/stop race controls.
- Spectator-safe participant endpoint.
- Aggregate horse/jockey leaderboard endpoint.
- Persistent referee jockey-inspection endpoint.
- Aggregate Admin/Landing statistics endpoint.

The backend contains a `Bet` model, but no betting router is mounted in `app.js`. Treat betting UI as a prototype until a backend contract is implemented.

## Known mock/fallback hotspots

- `src/Admin/useAdminModuleApi.js`: users, registrations, and results use the generic live-data hook; tournament and schedule/race use `AdminCompetitionModule.jsx`. Other Admin modules still expose sample data.
- `src/pages/spectator/Leaderboard.jsx`: horse rankings are honestly derived across all published result rows; jockey aggregation is explicitly unavailable.
- `src/pages/spectator/RaceDetail.jsx`: contenders are mock.
- `src/pages/spectator/PredictionDetail.jsx`: contenders, odds and market are mock.
- `src/pages/spectator/live-race/`: mock race transport, wallet and race script.
- `src/pages/spectator/Results.jsx`: published results are live; betting history is deliberately unavailable until a backend route exists.
- `src/pages/owner/OwnerPages.jsx`: registration and jockey-board fallbacks were removed in Phase 8. Other Owner mock sources remain outside that milestone.
- `src/Referee/JockeyInspection.jsx`: correctly remains read-only because no persistence API exists.

## Recommended implementation order

1. Add Referee `start` and `complete` API calls and update lifecycle UI/copy.
2. Integrate readiness, finalize and apply-penalties for Referee results.
3. Add Admin confirm and publish result actions.
4. Integrate violation options, penalty preview, confirm and dismiss.
5. Connect Admin tournament, round and race modules to live CRUD APIs.
6. Remove Spectator tournament/race/result fallbacks where backend data is sufficient. Completed.
7. Replace participant and leaderboard mocks only after a safe API/source is confirmed. Completed within current contract boundaries.
8. Keep Betting isolated as a prototype until its backend contract exists.

## Browser visual QA recovery

- Browser plugin is installed and enabled at version `26.616.32156`, matching the current Codex App runtime.
- Browser initialization previously failed before opening a page with: `node_repl/js: codex/sandbox-state-meta: missing field sandboxPolicy`.
- The failure also occurred for a trivial runtime check, so it is a Codex App/runtime metadata issue rather than a frontend or Vite error.
- Global config at `C:\Users\pc\.codex\config.toml` has now been changed from `js_repl = false` to `js_repl = true`.
- The current thread still used the old runtime after the config edit. Fully quit Codex App, reopen it, and create a new Local thread before testing again.
- In the new thread, test Browser initialization first. If it succeeds, start the frontend dev server and visually inspect the changed Spectator Leaderboard and Race Detail at desktop and mobile widths.
- If the same metadata error persists after a full restart and new thread, reinstall/toggle the Browser plugin and report the exact error through `/feedback`; do not attempt to add `sandboxPolicy` manually to browser scripts.

## First task for the next session

Phases 1 through 9 are complete. Start with the next Owner enrichment milestone only:

- Join owner-scoped `GET /api/jockey-assignments` data into Owner schedule and horse views so assigned jockey names and assignment states replace the current explicit assignment-unavailable labels.
- Audit derived horse summary fields such as next race and record. Populate only fields supported by registrations and assignments; keep race records unavailable until an owner-readable published-result contract exists.
- Keep the backend read-only.
- Verify with frontend build and authenticated Chrome QA, then report changed files plus remaining work.

## Prompt to open a new session

```text
Work only in D:\WDP\horse-racing-frontend unless I explicitly authorize backend changes.

Read horse-racing-frontend/docs/SESSION_HANDOFF_API_INTEGRATION.md first. Use actual backend code under D:\WDP\horse-racing-backend as a read-only API contract; do not rely on possibly stale backend Markdown files.

Chrome extension QA works from the VS Code Codex surface. Use authenticated Chrome QA after implementation when the local frontend and backend are running. The Codex App in-app Browser recovery notes above remain a separate surface.

Continue from "First task for the next session": join owner-scoped jockey assignments into Owner schedule and horse views, then audit the remaining derived horse summary fields. Inspect the current code before editing, preserve existing user changes and theme, and do not invent missing owner result or prize APIs.
```

## Keeping future sessions token-efficient

- Give the new session this handoff file instead of pasting the full chat history.
- State one concrete task per session or milestone.
- Ask the agent to inspect only files related to that task, plus the exact backend route/controller involved.
- Do not ask it to reread every project Markdown file on every session.
- At the end of each session, update this file with completed work, changed files, test results and the next task.
- Start a fresh session after completing a sizeable milestone; retain this file as the durable project memory.
- If code and this handoff disagree, code is authoritative and the handoff should be corrected.
