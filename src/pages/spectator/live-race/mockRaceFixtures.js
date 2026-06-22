import horseAmber from "../../../assets/pixel-horses/horse-amber.png";
import horseBlue from "../../../assets/pixel-horses/horse-blue.png";
import horseIvory from "../../../assets/pixel-horses/horse-ivory.png";
import horseMint from "../../../assets/pixel-horses/horse-mint.png";
import horseRed from "../../../assets/pixel-horses/horse-red.png";

export const mockRaces = [
  { id: "opening-sprint", name: "Opening Sprint", time: "14:00", distance: "1,200m", status: "Prediction Open", closesIn: "00:30", pool: "8,420 pts" },
  { id: "derby-trial", name: "Derby Trial", time: "15:30", distance: "1,600m", status: "Closing Soon", closesIn: "00:30", pool: "11,260 pts" },
  { id: "championship-final", name: "Championship Final", time: "17:00", distance: "2,000m", status: "Scheduled", closesIn: "00:30", pool: "5,940 pts" },
];

export const mockContenders = [
  { id: "thunderbolt", horse: "Thunderbolt", jockey: "Alex Rider", owner: "Minh Le", lane: 1, weight: "56kg", form: "1-2-1", probability: 64, odds: { win: 2.1, place: 1.42 }, image: horseAmber, color: "#f0a15c" },
  { id: "silver-flash", horse: "Silver Flash", jockey: "Chris Evans", owner: "Aisha Moreno", lane: 2, weight: "55kg", form: "2-1-3", probability: 53, odds: { win: 2.8, place: 1.7 }, image: horseMint, color: "#9dd5b1" },
  { id: "golden-gallop", horse: "Golden Gallop", jockey: "Elena Gilbert", owner: "Tuan Pham", lane: 3, weight: "57kg", form: "3-1-2", probability: 46, odds: { win: 3.4, place: 1.95 }, image: horseIvory, color: "#eee7d4" },
  { id: "midnight-run", horse: "Midnight Run", jockey: "David Miller", owner: "Nora Bennett", lane: 4, weight: "54kg", form: "4-2-2", probability: 38, odds: { win: 4.2, place: 2.25 }, image: horseRed, color: "#d96a61" },
  { id: "crimson-comet", horse: "Crimson Comet", jockey: "Maya Chen", owner: "Rachel Nguyen", lane: 5, weight: "55kg", form: "5-3-1", probability: 29, odds: { win: 5.6, place: 2.9 }, image: horseBlue, color: "#78b9ef" },
];

export const mockWallet = Object.freeze({ balance: 1280, currency: "points" });

export const mockActivePredictions = [
  { race: "Opening Sprint", type: "Win", pick: "Thunderbolt", stake: 200, odds: "2.10x", status: "Pending" },
  { race: "Derby Trial", type: "Place", pick: "Silver Flash", stake: 120, odds: "1.70x", status: "Locked" },
  { race: "Worcester Chase", type: "Exacta", pick: "Thunderbolt / Golden Gallop", stake: 80, odds: "7.14x", status: "Pending" },
];

const checkpointDistances = [
  [0, 145, 425, 715, 1000],
  [0, 132, 438, 692, 1000],
  [0, 158, 401, 748, 1000],
  [0, 121, 455, 681, 1000],
  [0, 149, 416, 726, 1000],
];

const mockFinishTimes = [61500, 64000, 56000, 67000, 59000];

export function createMockRaceScript(raceId, startsAt = Date.now() + 3000) {
  const durationMs = 68000;
  const checkpointTimes = [0, 15000, 30000, 45000];

  return {
    race_id: raceId,
    script_version: 1,
    issued_at: new Date().toISOString(),
    starts_at: new Date(startsAt).toISOString(),
    duration_ms: durationMs,
    track_length: 1000,
    horses: mockContenders.map((horse, horseIndex) => ({
      horse_id: horse.id,
      name: horse.horse,
      lane: horse.lane,
      color: horse.color,
      checkpoints: [...checkpointTimes, mockFinishTimes[horseIndex]].map((time, checkpointIndex) => ({
        time_ms: time,
        distance: checkpointDistances[horseIndex][checkpointIndex],
      })),
    })),
    sequence: 300,
  };
}

export function createMockRaceResult(raceId) {
  return {
    race_id: raceId,
    finished_at: new Date().toISOString(),
    results: [
      { horse_id: "golden-gallop", position: 1, finish_time_ms: 56000 },
      { horse_id: "crimson-comet", position: 2, finish_time_ms: 59000 },
      { horse_id: "thunderbolt", position: 3, finish_time_ms: 61500 },
      { horse_id: "silver-flash", position: 4, finish_time_ms: 64000 },
      { horse_id: "midnight-run", position: 5, finish_time_ms: 67000 },
    ],
    sequence: 301,
  };
}
