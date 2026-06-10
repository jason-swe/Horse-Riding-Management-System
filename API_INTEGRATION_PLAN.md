# API Integration Plan

## Goal

Connect the frontend to the backend APIs incrementally, starting from authentication/session flows and then replacing mock data by role workspace.

Auth and horse owner horse/profile APIs are already connected. The next work should account for the latest backend update pulled on 2026-06-11.

## Decisions Locked

- Frontend dev server stays on `http://localhost:5173`.
- Backend stays on `http://localhost:3000`; Vite proxy targets `http://127.0.0.1:3000` to avoid Windows localhost IPv6 issues.
- Frontend will call API paths through Vite proxy using `/api`.
- Frontend `.env` should use:

```env
VITE_API_BASE_URL=/api
```

- If a user has multiple roles, show a workspace chooser.
- In development signup, backend returns `data.verification.otp`; frontend should use that OTP with `POST /auth/verify-account` for local auto-verification only.
- Public signup creates a `spectator` account by default. Professional roles (`horse_owner`, `jockey`, `race_referee`) now require a role application and admin approval.
- `POST /auth/register/horse-owner` is legacy and now also creates a spectator account only. Do not build new frontend flows around it.
- File uploads are data URI/base64 fields such as `avatar_file_data`, `image_file_data`, `*_document_file_data`, or `contract.file_data`. Backend uploads these to Cloudinary; multipart is not supported for these endpoints yet.
- `race_referee` has no frontend workspace yet. Until it is implemented, show a not-available message for that role after login.
- This project scope is frontend integration only. Do not modify backend code unless the user explicitly changes scope.
- Test accounts are documented in `TEST_ACCOUNTS.md`; all listed test accounts use `Password123`.
- Race Referee UI/API integration is deferred until the Race Referee UI branch is merged.

## Backend Update Summary

The latest backend pull adds or changes these integration-relevant areas:

- Auth signup behavior changed to spectator-first. Users apply later for horse owner, jockey, or race referee roles.
- Dev verification returns `verification.otp`, not `verification.token`.
- New role application APIs:
  - `POST /role-applications/horse-owner`
  - `POST /role-applications/jockey`
  - `POST /role-applications/race-referee`
  - `GET /role-applications/me`
  - admin review endpoints under `/admin/role-applications`
- New admin user/role management APIs under `/admin/users`.
- Expanded jockey APIs for profile, approval status, assignments, schedule, results, stats, violations, and horse-jockey lookup.
- Jockey assignment create now supports optional `contract` upload via data URI/base64.
- New race referee operations:
  - horse checks under `/horse-checks`
  - referee reports under `/referee-reports`
- Email and Cloudinary service behavior is now documented. Frontend should assume uploaded file URLs are returned by backend after mutation.

## Task Checklist

- [x] Configure Vite proxy `/api` to `http://127.0.0.1:3000`.
- [x] Set frontend API base URL to `/api`.
- [x] Add frontend API client using `fetch`.
- [x] Add auth session helpers for token, user, roles, and active role.
- [x] Connect login form to `POST /auth/login`.
- [x] Connect signup role loading to `GET /auth/roles`.
- [x] Connect signup submit to `POST /auth/register`.
- [x] Auto verify development signup using `POST /auth/verify-account` when backend returns `verification.otp`.
- [x] Add protected route guard by role.
- [x] Add multi-role workspace chooser route.
- [x] Wire logout buttons to clear session and call `POST /auth/logout`.
- [ ] Verify login, signup, refresh, protected route, wrong-role, and logout scenarios manually.
- [x] Run frontend build.

## Phase 2 Owner API Checklist

- [x] Add horse owner API wrapper for profile and horse endpoints.
- [x] Add adapters from backend owner/horse schema to existing owner UI shape.
- [x] Connect owner horse list to `GET /horse-owner/horses`.
- [x] Connect owner horse detail to `GET /horse-owner/horses/:horseId`.
- [x] Connect owner horse create/edit to `POST/PATCH /horse-owner/horses`.
- [x] Connect owner profile page to `GET /horse-owner/profile`.
- [ ] Verify owner list/detail/create/edit/profile manually with a real horse owner account.
- [x] Run frontend build after Phase 2.

## Phase 3 Role Application Checklist

This phase should be done before connecting more role-specific workspaces, because new backend accounts are spectators until admin approval.

- [x] Add role application API wrapper for `/role-applications/*`.
- [x] Add file-to-data-URI helper for application documents and reuse it for future upload fields.
- [x] Update signup post-success UX:
  - spectator users can continue to spectator workspace.
  - users who picked horse owner/jockey/referee during signup should see the matching role application next step after verification/login.
- [x] Build role application status page using `GET /role-applications/me`.
- [x] Build horse owner role application form with required fields: `stable_name`, `address`, `license_number`, `ownership_type`.
- [x] Build jockey role application form with required fields: `license_number`, `height`, `weight`, `experience_years`, medical clearance, racing license document.
- [x] Build race referee role application form with required fields: `license_number`, `experience_years`, `accreditation_body`, rules training certificate, background check.
- [x] Prevent duplicate pending applications in the UI when `GET /role-applications/me` already has a pending application for that role.
- [ ] Refresh `/auth/me` after an application is approved and the user logs back in, so newly assigned roles appear in session.
- [x] Run frontend build.

## Phase 4 Jockey API Checklist

- [x] Add jockey API wrapper for `/jockeys/me`, assignments, schedule, results, stats, violations, and horse-jockey lookup endpoints.
- [x] Connect `/jockey/profile` to `GET /jockeys/me` and `GET /jockeys/me/approval-status`.
- [x] Connect `/jockey/invitations` and `/jockey/assignments` to `GET /jockeys/me/assignments`.
- [x] Wire invitation accept/reject actions to `POST /jockeys/me/assignments/:id/accept` and `POST /jockeys/me/assignments/:id/reject`.
- [x] Connect `/jockey/schedule` to `GET /jockeys/me/schedule`.
- [x] Connect `/jockey/results` to `GET /jockeys/me/results` and stats cards to `GET /jockeys/me/stats`.
- [x] Keep local mock fallback or empty states for missing backend data while data seeding is incomplete.
- [ ] Verify jockey dashboard/profile/invitations/assignments/schedule/results manually with a real jockey account.
- [x] Run frontend build.

## Phase 5 Admin API Checklist

- [x] Add admin API wrapper for `/admin/users` and `/admin/role-applications`.
- [x] Connect admin users module list to `GET /admin/users`.
- [ ] Connect admin user detail to `GET /admin/users/:id`.
- [x] Wire user status updates to `PATCH /admin/users/:id/status` for activate/suspend actions.
- [ ] Wire role assignment/removal to `POST /admin/users/:id/roles` and `DELETE /admin/users/:id/roles/:roleName`.
- [x] Add admin role application queue using `GET /admin/role-applications`.
- [x] Wire role application approve and reject flows.
- [ ] Wire application detail to `GET /admin/role-applications/:id`.
- [ ] After approving role applications, ensure profile information is visible in admin user detail.
- [ ] Verify admin users and registrations modules manually with a real admin account.
- [x] Run frontend build.

## Phase 6 Race Referee API Checklist

Deferred until the Race Referee UI branch is merged. After merge, connect these APIs without changing backend code.

- [ ] Add `/referee` protected routes and layout for users with `race_referee`.
- [ ] Add horse check API wrapper for `/horse-checks`.
- [ ] Add referee report API wrapper for `/referee-reports`.
- [ ] Build pre-race horse inspection list/detail and create/update flows.
- [ ] Build report draft/update/submit flow.
- [ ] Respect backend ownership rules: race referees can only act on races assigned to their referee profile.
- [ ] Run frontend build.

## Existing Owner Flow Follow-Up From Backend Update

- [ ] Add owner registration APIs for tournament/race registration and cancellation:
  - `POST /horse-owner/tournament-registrations`
  - `POST /horse-owner/race-registrations`
  - `PATCH /horse-owner/tournament-registrations/cancel`
  - `PATCH /horse-owner/race-registrations/cancel`
- [ ] Connect owner available jockey list/detail to `GET /horse-owner/jockeys` and `GET /horse-owner/jockeys/:jockeyId`.
- [ ] Add owner jockey assignment creation with optional `contract.file_data` via `POST /jockey-assignments`.
- [ ] Connect horse approval status to `GET /horse-owner/horses/:horseId/approval-status`.

## Implementation Notes

- API client should read `import.meta.env.VITE_API_BASE_URL`.
- API client should attach `Authorization: Bearer <token>` when a token exists.
- API client should normalize backend errors from `{ success, message, details }`.
- Session storage keys:
  - `horse_racing_token`
  - `horse_racing_user`
  - `horse_racing_roles`
  - `horse_racing_active_role`
- Test account reference:
  - `TEST_ACCOUNTS.md`
- Role redirect priority only applies when the user has one role. Multiple roles go to the chooser.
- Single-role redirect targets:
  - `admin` -> `/admin`
  - `horse_owner` -> `/owner`
  - `jockey` -> `/jockey`
  - `spectator` -> `/spectator`

## Test Checklist

- [x] Backend runs successfully on `localhost:3000`.
- [x] Frontend runs successfully on Vite dev server; latest verified URL is `http://127.0.0.1:5173/`.
- [ ] Invalid login shows backend error message.
- [ ] Valid login stores token and user session.
- [ ] Single-role login redirects to the correct workspace.
- [ ] Multi-role login redirects to workspace chooser.
- [ ] Signup validates password length, confirm password, and terms before API call.
- [ ] Valid signup registers and auto-verifies in development.
- [ ] Refreshing a protected route restores session using `/auth/me`.
- [ ] Expired or invalid token clears session and redirects to `/login`.
- [ ] Logout clears local session even if API logout fails.

## Progress Log

- Created plan file.
- Added Vite proxy, `/api` frontend env, API client, auth API wrapper, role routing helpers, and session storage helpers.
- Connected login and signup forms to backend auth endpoints, including development auto verification.
- Added role-protected routes, multi-role workspace chooser, logout integration, and auth UI states.
- Adjusted Vite proxy target to `127.0.0.1` after local proxy test hung through `localhost`.
- Verified backend roles endpoint, Vite dev server response, Vite proxy `/api/auth/roles`, and production build.
- Started Phase 2 owner API integration for profile and horse management pages.
- Phase 2 frontend build passed after owner API integration.
- Started Phase 3 role application integration after the backend changed signup to spectator-first role approval.
- Added `/spectator/role-applications`, role application API wrapper, data URI file helper, role-intent redirect after login, and updated signup verification to use `verification.otp`.
- Phase 3 frontend build passed after role application integration.
- Added `TEST_ACCOUNTS.md` with available Atlas/Supplement/Epic/RaceDay test users and common password.
- Confirmed working constraint: frontend-only implementation; backend code stays untouched.
- Deferred Race Referee workspace/API work until the Race Referee UI branch is merged.
- Started Phase 4 Jockey API integration.
- Added jockey API wrapper, robust backend-to-UI adapters, live data hook with mock fallback, and connected jockey dashboard/profile/invitations/assignments/schedule/results.
- Phase 4 frontend build passed after jockey API integration.
- Started Phase 5 Admin API integration.
- Added admin API wrapper, admin users/role-application adapters, live admin module hook, live users table, live role application queue, activate/suspend actions, and approve/reject role application actions.
- Phase 5 frontend build passed after initial admin API integration.

## Assumptions

- Backend response contract follows `horse-racing-backend/docs/API.md`.
- Backend development mode returns raw verification OTPs for signup and resend verification.
- Role-selected signup in the current UI is now a product intent, not immediate role assignment. The backend always creates a spectator until a role application is approved.
- No backend CORS package is needed for this phase because Vite proxy handles local development calls.
- Mock data remains in jockey, spectator, referee, and most admin pages until the corresponding integration phase.
