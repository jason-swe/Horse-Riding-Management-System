import { BET_TYPES } from "./fixedOddsRules.js";

export const FIXED_ODDS_CONTRACT_VERSION = 1;
export const FIXED_ODDS_CURRENCY = "PTS";
export const FIXED_ODDS_PRECISION = 2;
export const PAYOUT_ROUNDING = "nearest_integer";
export const ODDS_CHANGE_POLICY = "requote_required";

export const FIXED_ODDS_MARKET_STATES = Object.freeze({
  SCHEDULED: "scheduled",
  OPEN: "open",
  SUSPENDED: "suspended",
  CLOSED: "closed",
  SETTLED: "settled",
  VOID: "void",
});

const supportedBetTypes = new Set(BET_TYPES.map((type) => type.id));
const supportedMarketStates = new Set(Object.values(FIXED_ODDS_MARKET_STATES));

export function validateFixedOddsMarket(market, raceId) {
  const errors = [];
  if (!market || typeof market !== "object") return { isValid: false, errors: ["Market snapshot is missing."] };
  if (market.contractVersion !== FIXED_ODDS_CONTRACT_VERSION) errors.push("Unsupported market contract version.");
  if (!market.id) errors.push("Market ID is missing.");
  if (!market.raceId || String(market.raceId) !== String(raceId)) errors.push("Market does not belong to this race.");
  if (!supportedMarketStates.has(market.status)) errors.push("Market status is unsupported.");
  if (!Number.isFinite(market.minStake) || !Number.isFinite(market.maxStake) || market.minStake <= 0 || market.maxStake < market.minStake) errors.push("Stake limits are invalid.");
  if (market.currency !== FIXED_ODDS_CURRENCY) errors.push("Market currency is unsupported.");
  if (!Array.isArray(market.supportedBetTypes) || !market.supportedBetTypes.length || market.supportedBetTypes.some((type) => !supportedBetTypes.has(type))) errors.push("Supported bet types are invalid.");
  if (!market.selections || typeof market.selections !== "object") errors.push("Odds selections are missing.");
  if (!market.runnerStatuses || typeof market.runnerStatuses !== "object") errors.push("Runner availability is missing.");
  market.supportedBetTypes?.forEach((type) => {
    const selections = market.selections?.[type];
    if (!selections || !Object.keys(selections).length || Object.values(selections).some((odds) => !Number.isFinite(odds) || odds <= 1)) errors.push(`Odds are invalid for ${type}.`);
  });
  return { isValid: errors.length === 0, errors };
}

export function validateAcceptedBetReceipt(receipt, request) {
  const errors = [];
  if (!receipt?.bet?.id) errors.push("Receipt bet ID is missing.");
  if (receipt?.bet?.status !== "accepted") errors.push("Receipt is not accepted.");
  if (!Number.isFinite(receipt?.bet?.accepted_odds) || receipt.bet.accepted_odds <= 1) errors.push("Accepted odds are invalid.");
  if (Number(receipt?.bet?.stake) !== Number(request.stake)) errors.push("Receipt stake does not match the request.");
  if (String(receipt?.bet?.race_id) !== String(request.race_id)) errors.push("Receipt race does not match the request.");
  if (!Number.isFinite(receipt?.bet?.potential_return)) errors.push("Receipt potential return is missing.");
  if (!Number.isFinite(receipt?.wallet?.balance)) errors.push("Receipt wallet balance is missing.");
  return { isValid: errors.length === 0, errors };
}
