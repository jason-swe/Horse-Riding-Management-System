# Frontend Design Document - Horse Racing Tournament Management System

## 1. Architecture Overview
The frontend is a Vite + React single page application using `react-router-dom` for routing and custom CSS for the visual system.

### Technology Stack
- Framework: React 18
- Build tool: Vite
- Routing: `react-router-dom`
- Icons: `lucide-react` only
- Styling: `src/App.css`, `src/index.css`, and `src/pages/spectator/spectator.css`
- State: local React hooks (`useState`, `useEffect`, `useMemo`, `useRef`)

### Current Structure
- `src/App.jsx`: route map.
- `src/Landing Page/LandingPage.jsx`: public landing page.
- `src/Login/Login.jsx`: login page.
- `src/SignUp/SignUp.jsx`: register page.
- `src/Admin/*`: admin layout, dashboard, module pages, and mock module data.
- `src/layouts/MainLayout.jsx`: spectator shell with top nav and footer.
- `src/pages/spectator/*`: spectator pages.
- `src/pages/owner/*`: horse owner layout, pages, owner mock data, and owner-scoped styles.
- `src/pages/jockey/*`: jockey athlete layout, pages, jockey mock data/assets, and `jockey.css`.
- `src/components/DataTable.jsx`: reusable table.
- `src/components/SearchFilterBar.jsx`: reusable search + animated filter dropdown; supports a page-specific `placeholder` prop and uses lucide icons.

## 2. Current Page Map & Routing

### Public Routes
- `/`: Landing page with hero, horse profile section, stats, testimonials carousel, newsletter/footer, and CTAs to auth/spectator routes.
- `/login`: Two-panel login page with email/password form, remember me, forgot password link, social buttons, and hover states.
- `/signup`: Two-panel registration page with animated role dropdown, account form, social buttons, and hover states.
- `*`: Redirects to `/`.

### Admin Routes
- `/admin`: Admin control center dashboard.
- `/admin/:module`: Dynamic admin module page.

Supported admin modules are configured in `src/Admin/adminModules.js`:
- `users`: user and role management.
- `tournament`: tournament setup.
- `schedule`: race calendar and race slots.
- `registrations`: participant approval queue.
- `horses`: horse registry and readiness.
- `jockeys`: jockey invitations and assignments.
- `referees`: referee assignment and report status.
- `results`: race result publication and prizes.
- `predictions`: spectator prediction and reward management.

### Spectator Routes
All spectator routes render inside `MainLayout`.

- `/spectator`: spectator overview dashboard.
- `/spectator/tournaments`: searchable/filterable tournament list.
- `/spectator/tournaments/:tournamentId`: tournament detail page.
- `/spectator/leaderboard`: horses/jockeys leaderboard with tabs, podium, and table.
- `/spectator/predictions`: prediction room with odds board, betting slip, stake controls, active bets, and history.
- `/spectator/profile`: bettor profile, wallet, achievements, active bets, and history.
- `/spectator/results`: race results and betting history tabs.

### Jockey Routes
All jockey routes render inside `JockeyLayout`.

- `/jockey`: athlete command dashboard with invitation queue, next race, assignment summary, latest result, and race strip.
- `/jockey/invitations`: invitation-only race request management with Accept/Reject actions, filter controls, owner/horse/race context, and pending queue.
- `/jockey/schedule`: upcoming race schedule with date/time, tournament, venue, round, horse, and status filters.
- `/jockey/assignments`: horse pairing board with owner context, pairing status, race target, and assignment profile panel.
- `/jockey/results`: published result ledger with left date blocks, race/horse context, compact finish/time/prize metrics, and short status badges.
- `/jockey/profile`: athlete profile with portrait, availability, license, weight class, stable connection, contact details, next race, latest result, and notification activity.

### Horse Owner Routes
- `/owner`: implemented owner dashboard with stable summary, active horses, pending registrations, assigned jockeys, earnings, upcoming schedule, horse readiness, registration queue, quick actions, and notifications.
- `/owner/horses`: implemented horse list.
- `/owner/horses/new`: implemented add horse form.
- `/owner/horses/:horseId`: implemented horse detail.
- `/owner/horses/:horseId/edit`: implemented edit horse form.
- `/owner/registrations`: implemented tournament registration management.
- `/owner/jockeys`: implemented jockey assignments.
- `/owner/schedule`: implemented owner race schedule.
- `/owner/results`: implemented owner race results.
- `/owner/profile`: implemented owner profile.

### Planned But Not Implemented Routes
The following role dashboard is described by product scope but is not implemented in the current frontend:
- Race Referee dashboard routes (`/referee/...`)

## 3. Component Design

### Shared Components
- `DataTable`: table renderer with custom column renderers, empty state, and row hover behavior.
- `SearchFilterBar`: search input plus animated custom dropdown for status/category filters.
- `MainLayout`: spectator navigation, route transition wrapper, user profile shortcut, logout link, and shared footer.
- `AdminLayout`: admin sidebar, admin navigation, header, actions slot, and content container.

### Page-Specific UI Patterns
- Landing page:
  - Full-screen hero with brand/nav/auth CTAs.
  - Horse details stage with labeled facts.
  - Testimonial carousel.
  - Site footer and newsletter form.
- Login page:
  - Dark form panel + beige intro panel.
  - Primary submit button, social buttons, remember me checkbox, and account creation link.
- Sign up page:
  - Dark form panel + beige intro panel.
  - Custom animated role dropdown with scrollable option list.
  - Primary submit button, social buttons, and login link.
- Admin pages:
  - Metric cards, panels, module summaries, filters, tables, modal forms, action rows, badges.
- Horse owner pages:
  - Owner dashboard shell with top navigation, hero summary, metrics, readiness progress, upcoming schedule, registration queue, quick actions, and notification cards.
  - Owner notification bell opens a floating Facebook-style notification list with outside click/Escape close.
  - Owner registration timeline should keep date blocks clearly on the left and avoid stretching status into long bars when it creates visual imbalance.
- Jockey pages:
  - Jockey athlete shell with top navigation, hero-led pages, performance metrics, invitation management, assignment cards, schedule slots, results ledger, profile cards, and notification popover.
  - Jockey pages use English copy and an athlete-focused tone. The jockey participates by receiving invitations only.
  - Jockey result rows use compact metrics and status badges; status should not become a long horizontal progress bar.
  - Jockey profile prioritizes portrait, availability, license, weight class, stable connection, contact, next race, latest result, and notifications.
- Spectator pages:
  - Shared green dashboard theme.
  - Cards, badges, tabs, timelines, image cards, podiums, prediction pick cards, and table views.
  - Spectator overview currently uses a race-day command-board layout rather than a generic card dashboard.
  - Tournament list currently uses a scan-first board layout, not a large hero/marketing layout.

## 4. Design System

### Visual Direction
- Sporty, premium, race-day dashboard feel.
- Landing, auth, and spectator pages use a dark green + beige + orange identity.
- Admin pages use a dense operations dashboard style with dark panels and compact tables.
- Owner and jockey pages use a premium racing dashboard style with image-led heroes, compact operational cards, and athlete/stable context.

### Color Palette
- Landing/spectator green: `#3E5B49`
- Beige contrast: `#EEE7D4`
- Orange CTA/accent: `#ff6d14`, `#ff7b2b`, `#f0a15c`, `#d97735`
- Dark surfaces: deep green/near-black translucent panels
- Owner/spectator readable text:
  - Primary text: `#F7F3E8`
  - Heading text: `#FFF8EA`
  - Secondary text: `#E6DDC8`
  - Meta/helper text: `#D4C8B3`
  - Muted text minimum: `#C8BBA4`
  - Do not use text below roughly 70% opacity on the green background.
- Owner/spectator surfaces:
  - Page background: `#3E5B49`
  - Raised card background: `rgba(238, 231, 212, 0.10)` to `rgba(238, 231, 212, 0.14)`
  - Subtle row background: `rgba(255, 255, 255, 0.07)` to `rgba(255, 255, 255, 0.10)`
  - Border: `rgba(238, 231, 212, 0.22)` minimum for normal cards
  - Strong border/focus: `rgba(238, 231, 212, 0.42)` or orange focus ring
- Status colors:
  - Green: active/published/approved/won
  - Amber: pending/review/open
  - Red: rejected/suspended/lost
  - Blue/gray: informational/draft states

### Contrast Rules For Owner And Spectator Pages
- Owner and spectator pages sit on the updated green theme background, so body copy must be brighter than the old muted values.
- Avoid `rgba(245, 247, 243, 0.56)`, `0.58`, `0.62`, or similar low-opacity text for meaningful content.
- Reserve low-opacity text only for decorative labels, disabled UI, or non-essential metadata.
- For descriptions, table cells, card subtitles, list metadata, and schedule details, use `#E6DDC8` or `#D4C8B3`.
- For headings, entity names, metric values, and selected/active states, use `#FFF8EA` or `#F7F3E8`.
- For placeholder or disabled text, use `#B8AA93` and pair it with visible borders so the control still reads clearly.
- Icons should inherit the same contrast tier as the adjacent label; do not leave lucide icons at very faint opacity when they communicate action/status.
- Badges must use colored text with sufficient contrast and a visible border, not only a faint background tint.
- Hover states should increase contrast, not only move the element.

### Typography
- Headings use bold, condensed-feeling display treatment through CSS.
- Body text is clean sans-serif, optimized for cards, dashboards, and tables.
- Avoid negative letter spacing for compact UI unless already established in the current stylesheet.
- On owner and spectator dashboard surfaces, use a minimum practical body size of `0.88rem`; avoid tiny low-contrast helper text.

### Interaction
- Buttons should have visible hover and active states.
- Dropdowns use custom animated menus with scroll when options exceed menu height.
- Important form dropdowns, especially owner horse profile fields such as breed/status, should use a custom listbox/dropdown UI instead of a plain native `select` when visual consistency matters.
- Custom dropdown triggers must have clear hover, focus-visible, active, and expanded states; use a lucide chevron icon that rotates on open.
- Dropdown menus should animate open/closed with opacity and transform, render above surrounding cards through a local z-index layer, and avoid being clipped by parent containers.
- Long dropdown option lists must use a constrained max height with internal vertical scrolling, visible scrollbar styling, and readable selected/hover option states.
- Dropdown options should close the menu after selection and keep the selected value visible in the trigger.
- Notification bells should open floating toast/popover lists rather than navigating immediately. Popovers need an animated entrance, visible unread count, outside click/Escape close behavior, and links to relevant profile/detail pages.
- Route/page content may use light entrance animation where already established.
- Forms use clear focus rings and contrast-preserving background changes.

### Jockey Workspace Rules
- Keep all jockey UI scoped to `src/pages/jockey/jockey.css`.
- Use `src/pages/jockey/jockeyData.js` for local mock data until backend integration is available.
- Use the image references recorded in `jockey-image-assets.md` for jockey portraits, action shots, horse+jockey imagery, tracks, and celebration imagery.
- Jockey pages should feel like an athlete workspace, not an admin console: large race photography, confident headings, compact stats, and clear race-day actions.
- Participation model: jockeys only respond to owner invitations. Avoid UI that implies jockeys can browse and self-join races.
- Copy language: English.
- Results layout: left-aligned date block, race ID/race name/horse context, finish/time/prize metrics, and a short status badge. Avoid long status bars.
- Profile layout: portrait hero, status/availability panel, performance summary, contact details, license/form card, next race, latest result, and activity/notifications.
- Keep responsive layouts stable: fixed-format profile portraits, result metric grids, schedule slots, and nav controls must not resize unpredictably when content changes.

### Spectator Tournament Board Rules
- `/spectator/tournaments` is a betting-discovery board. The priority is showing many tournaments plus enough decision-making information.
- Do not reintroduce a large hero image on the tournaments list page.
- Default tournament ordering: `Active` first, `Upcoming` second, `Completed` last; within each status, sort by date ascending.
- Tournament cards should include status, location, date, track, distance, entries, liquidity hint, prize pool, and a detail action.
- Status labels should be short:
  - `Active`
  - `Upcoming`
  - `Closed`
- Status colors:
  - Active: green text/badge.
  - Upcoming: amber text/badge.
  - Closed/completed: muted beige/gray text/badge.
- Status badges sit on images, so they need a dark translucent/blurred background, visible border, and sufficient contrast.
- The filter area should stay minimal: a small `Tournament Board` chip with count, a long search input, and a compact status dropdown.
- Filter dropdowns must not be clipped by cards; keep the filter container `overflow: visible` and z-index above the tournament grid.
- Avoid large blank spaces in tournament cards. Do not force tall card heights; keep footer/prize/action near the metadata.
- Metrics in the tournament header should use short labels (`Active`, `Upcoming`, `Pools`, `Entries`) and keep values inside their cards.

## 5. Iconography Rule

Use `lucide-react` for all UI icons.

Do not add:
- Handwritten inline SVG icons.
- AI-generated icons.
- External icon images/logos for UI controls.
- Text-symbol icons such as `↗`, `▶`, `v`, or decorative emoji when a lucide icon exists.

Current code already uses `lucide-react` in spectator tournament/profile pages. Existing non-lucide icons still present in the codebase should be migrated when touched:
- Inline SVG social icons in landing/spectator footer.
- Inline SVG logout icon in `AdminLayout`.
- Text-symbol arrows/play/chevrons in landing and dropdown controls.
- Emoji/stat symbols in landing stats.

Brand text such as the `HR` wordmark may remain text, but functional icons must come from `lucide-react`.

## 6. Data & State Notes

The current frontend uses static/mock data:
- Admin module data lives in `src/Admin/adminModules.js`.
- Spectator tournament data lives in `src/pages/spectator/tournamentData.js`.
- Leaderboard, predictions, profile, and results pages define local mock arrays.
- Owner mock data lives in `src/pages/owner/ownerData.js`.
- Jockey mock data and image constants live in `src/pages/jockey/jockeyData.js`.

Current form actions prevent default submit behavior and do not call APIs yet.

Expected future flow:
1. User authenticates.
2. Auth token/session is stored.
3. User role determines redirect and route access.
4. Pages fetch data from backend endpoints.
5. Mutations update backend first, then update local UI state.

## 7. Implementation Guidelines

- Keep route definitions centralized in `src/App.jsx`.
- Prefer existing CSS classes and page patterns before adding new styles.
- Use custom dropdown/listbox patterns already established by SignUp and SearchFilterBar.
- For owner and spectator forms, prefer the custom animated dropdown/listbox pattern for meaningful select fields; only use native `select` for low-risk utility controls where platform styling is acceptable.
- Keep spectator pages scoped to `spectator.css`.
- Keep owner pages scoped to the owner page/style files.
- Keep jockey pages scoped to `src/pages/jockey/jockey.css` and reuse existing jockey shared classes before adding new ones.
- Keep admin module behavior data-driven through `adminModules.js`.
- Reuse `DataTable` for tabular spectator/admin views unless a module needs a specialized layout.
- Use `lucide-react` imports for all new icons.
- Do not introduce new inline SVGs or generated icon assets.
- When updating existing icon-like controls, replace them with lucide icons as part of the same change.
