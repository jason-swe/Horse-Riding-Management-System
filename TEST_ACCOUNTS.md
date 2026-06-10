# Test Accounts

These accounts are for frontend integration testing against the current backend dataset.

Common password for all listed accounts:

```text
Password123
```

## Accounts

| Role / State | Full name | Email |
| --- | --- | --- |
| Unverified | Atlas Unverified | `atlas_unverified_1780056201309_47787@example.com` |
| Admin | Atlas admin | `atlas_admin_1780056343254_64922_95742@example.com` |
| Horse Owner | Atlas horse_owner | `atlas_horse_owner_1780056343254_64922_76375@example.com` |
| Jockey | Atlas jockey | `atlas_jockey_1780056343254_64922_36688@example.com` |
| Jockey | Atlas jockey | `atlas_jockey_1780056343254_64922_98485@example.com` |
| Race Referee | Atlas race_referee | `atlas_race_referee_1780056343254_64922_95422@example.com` |
| Admin | Supplement admin | `supp_1780056509214_67506_admin@example.com` |
| Horse Owner | Supplement horse_owner | `supp_1780056509214_67506_horse_owner@example.com` |
| Jockey | Supplement jockey | `supp_1780056509214_67506_jockey@example.com` |
| Admin | Epic admin | `epic_admin_1780665221229_36247f2eb3d46@test.com` |
| Horse Owner | Epic horse_owner | `epic_horse_owner_1780665223254_9f6f6e310bb24@test.com` |
| Race Referee | Epic race_referee | `epic_race_referee_1780665224600_b4093c3a84f34@test.com` |
| Spectator | Epic spectator | `epic_spectator_1780665225938_d6a1e5fb8f44d@test.com` |
| Race Referee | RaceDay race_referee | `raceday_race_referee_1780714666021_8eac1326006a6@test.com` |
| Pending Verification | Mail Test | `mailtest@example.invalid` |

## Notes

- Frontend integration only. Do not change backend code for these test accounts.
- Race Referee UI/API work is waiting for the Race Referee UI branch to be merged.
- The `Mail Test` account is pending verification and is useful for testing blocked login or verification states.
