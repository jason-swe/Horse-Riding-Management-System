# Fixed-Odds Betting Backend Contract

## 1. Audit snapshot

Audit date: `2026-06-22`.

The current backend does not expose betting, wallet, fixed-odds market, payout, or realtime socket APIs.

Current backend evidence:

- `models/Bet.js` supports one `predicted_horse_id`, one optional `predicted_position`, `status`, and `reward_amount`.
- `models/Race.js` stores `status` as a free-form string with default `scheduled`.
- `models/RaceResult.js` supports `draft`, `confirmed`, and `published` results.
- `GET /api/race-results` now permits authenticated spectators. Backend also mounts a spectator-only published-result endpoint at `/users/spectator/races/:raceId/results`, outside the `/api` prefix used by the current frontend client.
- Approved registrations and accepted jockey assignments exist, but there is no spectator-safe aggregate participant endpoint.
- There is no wallet model or route in `app.js`.

The Phase 3 frontend therefore remains a prototype and must fail closed when a production market snapshot is absent or invalid.

## 2. Decisions locked on the frontend

| Contract item | Frontend decision |
|---|---|
| Contract version | Integer `1` |
| Currency | `PTS` |
| Odds format | Decimal odds |
| Odds precision | Two decimal places for display |
| Payout preview | `round(stake * displayed_odds)` |
| Accepted payout | Use `potential_return` from backend receipt |
| Accepted odds | Use `accepted_odds` from backend receipt |
| Odds change policy | `requote_required`; never silently accept changed odds |
| Idempotency | Unique `client_request_id` per submission |
| Form safety | Fail closed unless market status is exactly `open` |
| Realtime safety | `stop_betting` immediately closes modal and disables all controls |

Frontend constants and validators live in:

```text
src/pages/spectator/betting/fixedOddsContract.js
```

## 3. Decisions still required from backend/product

These items are not present in the current backend and are not considered confirmed:

1. Extended race lifecycle behavior beyond the implemented `scheduled -> running -> completed` referee flow, including cancel/postpone semantics.
2. Canonical market enum and allowed transitions.
3. Place settlement positions.
4. Show settlement positions.
5. Dead-heat settlement and fractional payout rules.
6. Scratched-horse behavior before and after market close.
7. Postponed, cancelled, and void race behavior.
8. Minimum and maximum stake policy.
9. Wallet ledger, currency ownership, and transaction consistency.
10. Odds rounding, payout rounding, fees, and maximum return.
11. Whether a changed quote requires explicit acceptance or rejects the request.

## 4. Required market snapshot

```json
{
  "contract_version": 1,
  "market_id": "market_id",
  "race_id": "race_id",
  "status": "open",
  "opens_at": "2026-06-13T08:30:00.000Z",
  "closes_at": "2026-06-13T08:59:30.000Z",
  "server_time": "2026-06-13T08:45:00.000Z",
  "currency": "PTS",
  "min_stake": 10,
  "max_stake": 1000,
  "odds_change_policy": "requote_required",
  "supported_bet_types": ["win", "place", "show", "quinella", "exacta", "trifecta"],
  "place_terms": null,
  "show_terms": null,
  "runner_statuses": {
    "horse_id": "active"
  },
  "selections": []
}
```

Allowed runner status proposal:

```text
active
scratched
suspended
```

The frontend removes non-active runners from an unfinished slip and disables their selection control. Settlement or refund behavior for an already accepted bet remains a backend/product decision.

Allowed market status proposal:

```text
scheduled
open
suspended
closed
settled
void
```

## 5. Submit and accepted receipt

Request:

```json
{
  "market_id": "market_id",
  "race_id": "race_id",
  "bet_type": "exacta",
  "horse_ids": ["horse_1", "horse_2"],
  "stake": 200,
  "displayed_odds": 8.5,
  "client_request_id": "uuid"
}
```

Accepted receipt:

```json
{
  "bet": {
    "id": "bet_id",
    "race_id": "race_id",
    "market_id": "market_id",
    "status": "accepted",
    "stake": 200,
    "accepted_odds": 8.5,
    "potential_return": 1700,
    "accepted_at": "2026-06-13T08:45:04.000Z"
  },
  "wallet": {
    "balance": 1080,
    "currency": "PTS"
  },
  "transaction_id": "transaction_id"
}
```

If odds changed, return a non-accepted response containing the current quote. The frontend must require a new explicit confirmation.

## 6. Spectator-safe read endpoints required

```text
GET /api/spectator/races/:raceId
GET /api/spectator/races/:raceId/participants
GET /api/race-results?race_id=:raceId&status=published
GET /users/spectator/races/:raceId/results (implemented backend mount, outside current `/api` proxy)
GET /api/spectator/races/:raceId/market
GET /api/spectator/wallet
POST /api/spectator/bets
```

Participants should include only approved registrations, accepted jockey assignments, eligible horse checks, and lane assignment. Spectator published-result reads now exist; spectator-safe participants, race detail aggregate, market, wallet, and bet APIs remain required.

## 7. Race script finish semantics

- `duration_ms` represents the maximum script playback duration.
- Every horse starts with `{ "time_ms": 0, "distance": 0 }`.
- Every horse ends at `track_length`, but final checkpoint timestamps must be allowed to differ.
- Final checkpoint order must agree with `race_finished.results`.
- `race_finished.results[].finish_time_ms` remains authoritative when it arrives.
- A script that forces every horse to finish at the same timestamp cannot express a meaningful finish order and should be rejected during contract review.

Example:

```json
[
  { "horse_id": "horse_3", "final_checkpoint": { "time_ms": 56000, "distance": 1000 } },
  { "horse_id": "horse_5", "final_checkpoint": { "time_ms": 59000, "distance": 1000 } },
  { "horse_id": "horse_1", "final_checkpoint": { "time_ms": 61500, "distance": 1000 } }
]
```

## 8. Session Status - 2026-06-14

- Frontend fixed-odds contract version remains `1` and mock-only.
- Six betting types are implemented in the UI.
- `stop_betting` immediately disables the complete form.
- Accepted receipt validation, odds retention, wallet reconciliation boundaries, scratched runner handling, and idempotency expectations are documented.
- No production market, wallet, bet, odds, settlement, or realtime endpoint is available yet.
- Production integration must not replace the mock adapter until unresolved contract decisions are confirmed.
