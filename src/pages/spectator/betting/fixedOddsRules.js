export const BET_TYPES = Object.freeze([
  { id: "win", label: "Win", cardinality: 1, ordered: true, slots: ["Winner"], description: "Pick the race winner." },
  { id: "place", label: "Place", cardinality: 1, ordered: true, slots: ["Placed horse"], description: "Pick one horse to finish in a paid Place position." },
  { id: "show", label: "Show", cardinality: 1, ordered: true, slots: ["Show horse"], description: "Pick one horse to finish in a paid Show position." },
  { id: "quinella", label: "Quinella", cardinality: 2, ordered: false, slots: ["Horse A", "Horse B"], description: "Pick the first two finishers in any order." },
  { id: "exacta", label: "Exacta", cardinality: 2, ordered: true, slots: ["1st", "2nd"], description: "Pick first and second in the exact order." },
  { id: "trifecta", label: "Trifecta", cardinality: 3, ordered: true, slots: ["1st", "2nd", "3rd"], description: "Pick the Top 3 in the exact order." },
]);

export function getBetType(typeId) {
  return BET_TYPES.find((type) => type.id === typeId) || BET_TYPES[0];
}

export function getSelectionKey(type, horseIds) {
  const ids = horseIds.filter(Boolean);
  return (type.ordered ? ids : [...ids].sort()).join(":");
}

export function updateSelection(current, horseId, type) {
  const next = current.slice(0, type.cardinality);
  const existingIndex = next.indexOf(horseId);

  if (type.cardinality === 1) return existingIndex === 0 ? [] : [horseId];
  if (existingIndex >= 0) return next.filter((id) => id !== horseId);
  if (next.length < type.cardinality) return [...next, horseId];
  return [...next.slice(0, -1), horseId];
}

export function moveSelection(current, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= current.length) return current;
  const next = [...current];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function isSelectionComplete(selection, type) {
  return selection.length === type.cardinality && new Set(selection).size === type.cardinality;
}
