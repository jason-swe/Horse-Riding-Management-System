export const ownerProfile = {
  name: "Minh Le",
  stable: "Minh Le Stable",
  email: "minh.le@stable.example",
  phone: "+84 90 218 7744",
  location: "Ho Chi Minh City, VN",
  status: "Verified",
  season: "Season 2026",
  joined: "Joined January 2024",
  winRate: "58%",
  earnings: "$42,860",
};

export const ownerHorses = [
  {
    id: "H-001",
    name: "Storm Arrow",
    breed: "Thoroughbred",
    age: 6,
    height: "16.2hh",
    weight: "468 kg",
    status: "Ready",
    readiness: 92,
    jockey: "Alex Rider",
    nextRace: "Emerald Sprint",
    healthNote: "Passed race readiness review. Hoof and cardio check clear.",
    record: "8 starts / 4 wins",
  },
  {
    id: "H-002",
    name: "Blue Horizon",
    breed: "Warmblood",
    age: 7,
    height: "16.0hh",
    weight: "476 kg",
    status: "Inspection set",
    readiness: 84,
    jockey: "Maya Chen",
    nextRace: "Derby Trial",
    healthNote: "Inspection scheduled before Derby Trial confirmation.",
    record: "11 starts / 5 wins",
  },
  {
    id: "H-003",
    name: "Golden Mane",
    breed: "Arabian",
    age: 5,
    height: "15.3hh",
    weight: "452 kg",
    status: "Needs review",
    readiness: 68,
    jockey: "Unassigned",
    nextRace: "Sunset Stakes",
    healthNote: "Profile update required before tournament approval.",
    record: "5 starts / 1 win",
  },
  {
    id: "H-004",
    name: "Night Sprint",
    breed: "Thoroughbred",
    age: 8,
    height: "16.1hh",
    weight: "470 kg",
    status: "Ready",
    readiness: 89,
    jockey: "Noah Bennett",
    nextRace: "Night Circuit",
    healthNote: "Ready. Equipment check completed last week.",
    record: "13 starts / 6 wins",
  },
];

export const ownerRegistrations = [
  { id: "REG-221", tournament: "Spring Cup 2026", horseId: "H-001", horse: "Storm Arrow", submitted: "May 24", status: "Approved", note: "Race slot confirmed" },
  { id: "REG-224", tournament: "Night Circuit", horseId: "H-002", horse: "Blue Horizon", submitted: "May 26", status: "Pending", note: "Awaiting admin review" },
  { id: "REG-229", tournament: "Sunset Stakes", horseId: "H-003", horse: "Golden Mane", submitted: "May 29", status: "Review", note: "Horse profile update required" },
  { id: "REG-232", tournament: "Harbor Derby", horseId: "H-004", horse: "Night Sprint", submitted: "May 18", status: "Rejected", note: "Entry limit reached" },
];

export const ownerJockeys = [
  { id: "J-014", name: "Alex Rider", assignedHorse: "Storm Arrow", status: "Assigned", races: 18, wins: 9, availability: "Available Jun 03" },
  { id: "J-022", name: "Maya Chen", assignedHorse: "Blue Horizon", status: "Pending", races: 12, wins: 5, availability: "Invitation sent" },
  { id: "J-031", name: "Noah Bennett", assignedHorse: "Night Sprint", status: "Assigned", races: 17, wins: 6, availability: "Available Jun 08" },
  { id: "J-044", name: "Sofia Reyes", assignedHorse: "Unassigned", status: "Available", races: 9, wins: 3, availability: "Open for invite" },
  { id: "J-052", name: "Elena Gilbert", assignedHorse: "Unassigned", status: "Invited", races: 19, wins: 8, availability: "Response due tomorrow" },
];

export const ownerSchedule = [
  { id: "R-101", time: "Jun 03, 14:00", race: "Emerald Sprint", tournament: "Spring Cup 2026", horse: "Storm Arrow", jockey: "Alex Rider", venue: "Grandstand A", round: "Heat 1", status: "Confirmed" },
  { id: "R-104", time: "Jun 04, 15:30", race: "Derby Trial", tournament: "Royal Track Series", horse: "Blue Horizon", jockey: "Maya Chen", venue: "Turf Circuit", round: "Qualifier", status: "Pending" },
  { id: "R-109", time: "Jun 05, 17:00", race: "Sunset Stakes", tournament: "Sunset Stakes", horse: "Golden Mane", jockey: "Unassigned", venue: "Main Track", round: "Heat 2", status: "Review" },
  { id: "R-116", time: "Jun 08, 20:00", race: "Night Circuit", tournament: "Night Circuit", horse: "Night Sprint", jockey: "Noah Bennett", venue: "Arena B", round: "Final", status: "Confirmed" },
];

export const ownerResults = [
  { id: "RES-041", date: "May 24", race: "Kentucky Derby Classic", horse: "Storm Arrow", position: 1, time: "1:10.42", prize: "$18,400", status: "Published" },
  { id: "RES-038", date: "May 18", race: "Royal Ascot Qualifier", horse: "Blue Horizon", position: 3, time: "1:12.08", prize: "$6,200", status: "Published" },
  { id: "RES-031", date: "May 10", race: "Dubai Sprint Heat", horse: "Night Sprint", position: 2, time: "1:11.64", prize: "$9,600", status: "Published" },
  { id: "RES-027", date: "May 02", race: "Laurel Park Invitational", horse: "Golden Mane", position: 5, time: "1:14.21", prize: "$0", status: "Closed" },
];

export const ownerNotifications = [
  "Storm Arrow passed race readiness review.",
  "Maya Chen has not responded to the Derby Trial invitation.",
  "Golden Mane requires one profile update before approval.",
];

export const availableTournaments = [
  "Spring Cup 2026",
  "Night Circuit",
  "Sunset Stakes",
  "Royal Track Series",
  "Harbor Derby",
];
