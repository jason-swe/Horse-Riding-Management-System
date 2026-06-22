export const tournaments = [
  { id: 1, name: "Grand National Cup 2026", location: "Cheltenham, UK", status: "Active", prize: "$500,000", date: "2026-06-15", image: "https://www.thoroughbreddailynews.com/wp-content/uploads/2024/06/Rashabar_PRINT_Getty.jpg", distance: "1,600m", track: "Turf", entries: 12 },
  { id: 2, name: "Royal Ascot Gold Cup", location: "Ascot, UK", status: "Upcoming", prize: "$1,200,000", date: "2026-07-20", image: "https://thefreepps.com/wp-content/uploads/2025/11/Horse-Racing-Tournaments-Blog-Header.jpg", distance: "2,400m", track: "Turf", entries: 16 },
  { id: 3, name: "Kentucky Derby Classic", location: "Louisville, USA", status: "Completed", prize: "$800,000", date: "2026-05-10", image: "https://vstatic.vietnam.vn/vietnam/resource/IMAGE/2026/05/24/1779604360557_7d3b4332-7723-438d-bb2e-e53f144f25d9.jpeg", distance: "2,000m", track: "Dirt", entries: 14 },
  { id: 4, name: "Dubai World Cup", location: "Meydan, UAE", status: "Upcoming", prize: "$10,000,000", date: "2026-08-05", image: "https://static.americasbestracing.net/s3fs-public/styles/large_hero_16_9/public/article/laurel_race_start_eclipse.JPG?itok=Qcp_VvF0&c=aa1a0a4302b835d3e66dfc6717e34104", distance: "2,000m", track: "Dirt", entries: 18 },
  { id: 5, name: "Prix de l'Arc de Triomphe", location: "Paris, France", status: "Active", prize: "$2,000,000", date: "2026-06-22", image: "https://www.thoroughbreddailynews.com/wp-content/uploads/2024/06/Rashabar_PRINT_Getty.jpg", distance: "2,400m", track: "Turf", entries: 15 },
  { id: 6, name: "Worcester Summer Chase", location: "Worcester, UK", status: "Upcoming", prize: "$350,000", date: "2026-07-04", image: "https://www.worcester-racecourse.co.uk/WorcesterRacecourse/images/upload/bb03d37b-d42a-486d-b913-cc62a889bf70.webp", distance: "1,800m", track: "Turf", entries: 10 },
  { id: 7, name: "Wolverhampton Night Stakes", location: "Wolverhampton, UK", status: "Active", prize: "$420,000", date: "2026-06-28", image: "https://www.wolverhampton-racecourse.co.uk/WolverhamptonRacecourse/images/upload/caf125cb-8906-47a3-a2b9-041537b8e080.webp", distance: "1,400m", track: "Synthetic", entries: 11 },
  { id: 8, name: "Melbourne Cup Trial", location: "Melbourne, AU", status: "Upcoming", prize: "$950,000", date: "2026-09-12", image: "https://agrifutures.com.au/wp-content/uploads/2022/08/a8-scaled.jpg", distance: "3,200m", track: "Turf", entries: 20 },
  { id: 9, name: "Laurel Park Invitational", location: "Maryland, USA", status: "Completed", prize: "$280,000", date: "2026-04-18", image: "https://static.americasbestracing.net/s3fs-public/styles/large_hero_16_9/public/article/laurel_race_start_eclipse.JPG?itok=Qcp_VvF0&c=aa1a0a4302b835d3e66dfc6717e34104", distance: "1,500m", track: "Dirt", entries: 9 },
  { id: 10, name: "Meydan Sprint Festival", location: "Dubai, UAE", status: "Active", prize: "$1,700,000", date: "2026-06-30", image: "https://vstatic.vietnam.vn/vietnam/resource/IMAGE/2026/05/24/1779604360557_7d3b4332-7723-438d-bb2e-e53f144f25d9.jpeg", distance: "1,200m", track: "Dirt", entries: 13 },
  { id: 11, name: "Ascot Autumn Classic", location: "Ascot, UK", status: "Upcoming", prize: "$780,000", date: "2026-10-02", image: "https://thefreepps.com/wp-content/uploads/2025/11/Horse-Racing-Tournaments-Blog-Header.jpg", distance: "2,100m", track: "Turf", entries: 14 },
  { id: 12, name: "Paris Turf Masters", location: "Paris, France", status: "Completed", prize: "$620,000", date: "2026-03-24", image: "https://images.squarespace-cdn.com/content/v1/5f99b7932a3e654c26fd0c52/39d267e3-5397-4600-b49c-322d4b14e4f8/Screenshot+2023-02-10+at+11.52.07+AM.png", distance: "1,900m", track: "Turf", entries: 12 },
];

export const tournamentRaces = [
  { id: "race-opening-sprint", time: "14:00", raceDate: "2026-06-15T14:00:00.000Z", name: "Opening Sprint", roundName: "Opening round", distance: "1,200m", location: "Grandstand Track", runnerCount: 5, maxParticipants: 8, raceStatus: "scheduled", bettingStatus: "open", bettingClosesAt: "2026-06-15T13:59:30.000Z" },
  { id: "race-derby-trial", time: "15:30", raceDate: "2026-06-15T15:30:00.000Z", name: "Derby Trial", roundName: "Qualifying round", distance: "1,600m", location: "Grandstand Track", runnerCount: 5, maxParticipants: 8, raceStatus: "running", bettingStatus: "closed" },
  { id: "race-championship-final", time: "17:00", raceDate: "2026-06-15T17:00:00.000Z", name: "Championship Final", roundName: "Final round", distance: "2,000m", location: "Main Circuit", runnerCount: 5, maxParticipants: 8, raceStatus: "scheduled", bettingStatus: "scheduled" },
  { id: "race-morning-classic", time: "10:30", raceDate: "2026-06-15T10:30:00.000Z", name: "Morning Classic", roundName: "Opening round", distance: "1,400m", location: "Main Circuit", runnerCount: 5, maxParticipants: 8, raceStatus: "completed", bettingStatus: "settled", resultStatus: "published" },
];

export const tournamentContenders = [
  { horse: "Thunderbolt", jockey: "Alex Rider", odds: "2.1x", form: "1-2-1" },
  { horse: "Silver Flash", jockey: "Chris Evans", odds: "2.8x", form: "2-1-3" },
  { horse: "Golden Gallop", jockey: "Elena Gilbert", odds: "3.4x", form: "3-1-2" },
  { horse: "Midnight Run", jockey: "David Miller", odds: "4.2x", form: "4-2-2" },
];
