# Horse Racing Tournament Management System

## Project Overview
A system to manage horse racing tournaments, replacing manual processes with a synchronized digital platform. It handles registrations, race scheduling, result tracking, and spectator predictions.

## Actors & Responsibilities
- **Horse Owner**: Registers horses, hires/selects jockeys, manages horse info, tracks results/prizes.
- **Jockey**: Manages profile, accepts/rejects race invitations, tracks personal achievements.
- **Race Referee**: Inspects horses, monitors races, records violations, confirms results, writes reports.
- **Spectator**: Views schedules/results, predicts race outcomes, receives prediction rewards.
- **Admin**: Manages users/roles, schedules tournaments/races, approves registrations, assigns referees, publishes results.

## Domain Entities
- `Horse Owner`, `Jockey`, `Horse`, `Tournament`, `Race`, `Registration`, `Race Result`, `Bet` (Prediction), `Prize`, `Referee Report`.

## Functional Requirements (FR)
### Horse Owner
- Account registration, Horse registration, Information management, Jockey hiring/selection, Race schedule viewing, Result/prize tracking.

### Jockey
- Account registration, Invitation management (Accept/Reject), Assignment tracking, Schedule, result/achievement tracking, and athlete profile management.

### Race Referee
- Pre-race horse inspection, Race monitoring and violation processing, Result confirmation and report generation.

### Spectator
- Tournament and schedule viewing, Live result and ranking tracking, Outcome prediction, Reward notifications.

### Admin
- User/role management, Tournament/Race/Round scheduling, Registration approval, Horse/Jockey list management, Referee assignment, Result publication.

## Tech Stack & Design
- **Frontend**: React (Vite), react-router-dom.
- **Theme Colors**: 
  - Primary (Deep Green): `#1D3024`
  - Contrast (Beige): `#EEE7D4`
- **Project Context**: WDP301 Course (FPT University HCM).

## Frontend Implementation Progress
- **Layouts**: `MainLayout` implemented with adaptive topbar and full-featured footer.
- **Shared Components**: `DataTable` and `SearchFilterBar` developed for data-heavy views. `SearchFilterBar` now accepts a custom `placeholder` prop and uses `lucide-react` search/chevron icons.
- **Horse Owner Pages**:
  - Owner workspace has been redesigned with a green/beige/orange premium dashboard visual system.
  - Implemented owner dashboard, horse management/detail/edit flow, registrations, jockeys, schedule, results, profile, and Facebook-style notification popover in `OwnerLayout`.
  - Horse profile edit no longer uses readiness as a primary UI block. Meaningful dropdown fields should use the optimized custom animated listbox pattern documented in `design.md`.
- **Jockey Pages**:
  - Jockey role workspace is implemented under `/jockey` with `JockeyLayout`, top navigation, profile/logout actions, and Facebook-style notification popover.
  - Implemented routes: `/jockey`, `/jockey/invitations`, `/jockey/schedule`, `/jockey/assignments`, `/jockey/results`, and `/jockey/profile`.
  - Jockey UX direction is athlete-focused: invitation-only race participation, English copy, image-led hero sections, compact performance metrics, horse pairing context, race schedule clarity, published results ledger, and profile/availability management.
  - Jockey data and asset references live in `src/pages/jockey/jockeyData.js`; image source notes are captured in `jockey-image-assets.md`.
- **Spectator Pages**: 
  - `SpectatorHome`: Redesigned as a race-day command board with live race context, compact stats, race timeline, reward wallet, market favorites, featured tournament strip, and quick actions.
  - `TournamentList`: Redesigned as a scan-first tournament board. It intentionally does not use a large image hero. Active tournaments sort first, then upcoming, then completed. Cards expose betting-relevant info: status, location, date, track, distance, entries, liquidity hint, prize pool, and detail action.
  - `Leaderboard`: Implemented with tabbed views for Horses and Jockeys.

## Current Spectator Tournament UI Notes
- `/spectator/tournaments` should prioritize seeing many tournaments at once over marketing-style hero presentation.
- Keep the filter bar minimal: left chip with `Tournament Board` plus count, long search input, compact status dropdown.
- Status labels should stay short: `Active`, `Upcoming`, `Closed`.
- Status color language:
  - `Active`: green text/badge.
  - `Upcoming`: amber text/badge.
  - `Closed`/completed: muted beige/gray text/badge.
- Dropdown menus must render above cards; keep filter wrapper `overflow: visible` and higher z-index.
- Avoid forcing tournament cards to equal tall heights. Keep card footer close to metadata so there is no large blank gap.
- Metrics in the top board must stay inside their cards; use short labels (`Active`, `Upcoming`, `Pools`, `Entries`) and no wrapping for values like `$4.6M`.

## Current Jockey UI Notes
- Jockey pages use the same premium racing palette as owner pages, scoped in `src/pages/jockey/jockey.css`.
- Keep the role language athlete-oriented and in English. The jockey can only receive and respond to owner invitations; do not design open self-registration into arbitrary races unless product scope changes.
- Navigation lives in `JockeyLayout`; keep route additions centralized in `src/App.jsx`.
- Results should read like a performance ledger: date block on the left, race/horse context in the center, compact finish/time/prize metrics, and a short status badge. Do not stretch status into a long horizontal bar.
- Profile should emphasize portrait, availability, license, weight class, stable connection, contact details, next race, latest result, and notifications.
- Notifications for jockey and owner should behave like a toast/popover list: bell button toggles a floating list, supports outside click/Escape close, and links to profile or relevant detail pages.
