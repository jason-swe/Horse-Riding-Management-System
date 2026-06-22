import { mockContenders } from "../live-race/mockRaceFixtures.js";
import { BET_TYPES, getSelectionKey } from "./fixedOddsRules.js";
import { FIXED_ODDS_CONTRACT_VERSION, FIXED_ODDS_MARKET_STATES, ODDS_CHANGE_POLICY, PAYOUT_ROUNDING } from "./fixedOddsContract.js";

const singleOdds = {
  win: [2.1, 2.8, 3.4, 4.2, 5.6],
  place: [1.42, 1.7, 1.95, 2.25, 2.9],
  show: [1.2, 1.31, 1.46, 1.62, 1.88],
};

function permutations(items, length) {
  if (length === 1) return items.map((item) => [item]);
  return items.flatMap((item) => permutations(items.filter((candidate) => candidate !== item), length - 1).map((rest) => [item, ...rest]));
}

function combinations(items, length, start = 0, prefix = []) {
  if (prefix.length === length) return [prefix];
  const result = [];
  for (let index = start; index < items.length; index += 1) result.push(...combinations(items, length, index + 1, [...prefix, items[index]]));
  return result;
}

function buildSelections(type) {
  const ids = mockContenders.map((horse) => horse.id);
  if (type.cardinality === 1) {
    return Object.fromEntries(ids.map((id, index) => [id, singleOdds[type.id][index]]));
  }

  const groups = type.ordered ? permutations(ids, type.cardinality) : combinations(ids, type.cardinality);
  return Object.fromEntries(groups.map((horseIds, index) => {
    const base = horseIds.reduce((total, id) => total * singleOdds.win[ids.indexOf(id)], 1);
    const multiplier = type.id === "quinella" ? 0.74 : type.id === "exacta" ? 0.92 : 1.16;
    const variance = 1 + ((index % 5) - 2) * 0.018;
    return [getSelectionKey(type, horseIds), Number((base * multiplier * variance).toFixed(2))];
  }));
}

export const mockFixedOddsMarket = Object.freeze({
  contractVersion: FIXED_ODDS_CONTRACT_VERSION,
  id: "market-race-opening-sprint-fixed",
  raceId: "race-opening-sprint",
  status: FIXED_ODDS_MARKET_STATES.OPEN,
  currency: "PTS",
  minStake: 10,
  maxStake: 1000,
  oddsChangePolicy: ODDS_CHANGE_POLICY,
  payoutRounding: PAYOUT_ROUNDING,
  placeTerms: null,
  showTerms: null,
  runnerStatuses: {
    "thunderbolt": "active",
    "silver-flash": "active",
    "golden-gallop": "active",
    "midnight-run": "scratched",
    "crimson-comet": "active",
  },
  supportedBetTypes: BET_TYPES.map((type) => type.id),
  selections: Object.fromEntries(BET_TYPES.map((type) => [type.id, buildSelections(type)])),
});

export function createMockFixedOddsMarket(raceId) {
  return {
    ...mockFixedOddsMarket,
    id: `market-${raceId}-fixed`,
    raceId,
  };
}

export function getMarketOdds(market, type, horseIds) {
  if (horseIds.length !== type.cardinality) return 0;
  return market.selections[type.id]?.[getSelectionKey(type, horseIds)] || 0;
}
