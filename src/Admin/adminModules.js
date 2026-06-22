export const adminModules = {
  users: {
    title: "Users & Roles",
    eyebrow: "User management",
    description:
      "Manage accounts for Horse Owner, Jockey, Race Referee, Spectator, and Admin roles. Assign permissions, review account status, and keep access aligned with tournament operations.",
    primaryActions: ["Create account", "Assign role", "Suspend user"],
    filters: {
      searchPlaceholder: "Search user ID, name, role, status...",
      statusOptions: ["All", "Active", "Pending", "Suspended"],
    },
    summary: [
      { label: "Active users", value: "248" },
      { label: "Pending reviews", value: "18" },
      { label: "Role changes today", value: "07" },
    ],
    sections: [
      {
        title: "Access control",
        items: [
          "Assign roles by tournament responsibility.",
          "Update access for owner, jockey, referee, spectator, and admin.",
          "Track verification and approval history.",
        ],
      },
      {
        title: "Account status",
        items: [
          "Review active, suspended, and pending accounts.",
          "Reset credentials when required.",
          "Keep audit records for account activity.",
        ],
      },
    ],
    tools: [
      {
        title: "Role filter",
        content: "Quick search by role, status, or verification stage before editing user access.",
      },
      {
        title: "Permission matrix",
        content: "Display a toggle grid for module access such as races, registrations, and results.",
      },
    ],
    tables: [
      {
        title: "User accounts",
        columns: ["ID", "Name", "Role", "Status", "Last login"],
        rows: [
          ["USR-101", "Nhan Tran", "Admin", "Active", "Today 09:12"],
          ["USR-102", "Minh Le", "Horse Owner", "Active", "Today 08:40"],
          ["USR-103", "Anh Khoa", "Jockey", "Pending", "Never"],
          ["USR-104", "Thanh Ha", "Spectator", "Suspended", "2026-05-18"],
          ["USR-105", "Bao Nguyen", "Race Referee", "Active", "Today 07:55"],
        ],
      },
    ],
  },
  horses: {
    title: "Horses",
    eyebrow: "Horse registry",
    description:
      "Manage comprehensive horse profiles covering identification, pedigree, physical stats, performance data, and race history. All records must be verified before a horse enters any race.",
    primaryActions: ["Add horse", "Verify profile", "Set readiness"],
    filters: {
      searchPlaceholder: "Search ID, microchip, name, breed, owner, trainer...",
      statusOptions: ["All", "Ready", "Review", "Injured", "Retired"],
    },
    summary: [
      { label: "Registered horses", value: "76" },
      { label: "Race-ready", value: "61" },
      { label: "Under review", value: "15" },
    ],
    sections: [
      {
        title: "Identity & Pedigree",
        items: [
          "Each horse has a unique ID and microchip number for tournament registration.",
          "Age group and gender (Colt/Horse, Filly/Mare, Gelding) determine eligible race categories.",
          "Sire/Dam pedigree records inform distance preference and surface adaptability research.",
          "Owner and trainer contact is stored for administrative coordination.",
        ],
      },
      {
        title: "Physical & Health",
        items: [
          "Weight is monitored each week — fluctuations above ±5 kg trigger a review flag.",
          "Height is recorded in hands (1 hand = 10.16 cm) measured at the withers.",
          "Hoof care log tracks last shoeing date and shoe type (aluminium for race day, steel for training).",
          "Health notes from referee inspections are stored per horse.",
        ],
      },
      {
        title: "Performance & Training",
        items: [
          "GPS and sensor data (Equimetre/Polar) provide max speed and 200 m sectional times from breeze-ups.",
          "Exercise heart rate peaks at 200–240 bpm; recovery time to under 100 bpm is the primary fitness metric.",
          "Stride length (~7–8 m for elite horses) and stride frequency are logged per session.",
          "Training sessions are timestamped and compared against race-day benchmarks.",
        ],
      },
      {
        title: "Race History & Handicap",
        items: [
          "Race record stored as Starts–1st–2nd–3rd (e.g. 10-3-2-1).",
          "Handicap rating (points) assigned by officials based on form — higher rating means extra weight in future races.",
          "Points earned per race placement are tracked in the system instead of monetary prizes.",
          "Career stats and rating history are visible for selection and research purposes.",
        ],
      },
    ],
    tools: [
      {
        title: "Horse search",
        content: "Filter by horse name, microchip, owner, breed, and readiness before assigning to a race slot.",
      },
      {
        title: "Inspection notes",
        content: "Health and referee inspection notes per horse — determine eligibility and flag review cases.",
      },
    ],
    tables: [
      {
        title: "Horse registry — Identity & Ownership",
        columns: ["Horse ID", "Microchip", "Name", "Age", "Gender", "Breed", "Owner", "Trainer", "Status"],
        rows: [
          ["H-001", "MC-884412", "Storm Arrow", "4", "Colt", "Thoroughbred", "Minh Le", "Coach Bao", "Ready"],
          ["H-002", "MC-771023", "Blue Horizon", "5", "Gelding", "Warmblood", "Nhan Tran", "Coach Linh", "Ready"],
          ["H-003", "MC-992301", "Golden Mane", "3", "Filly", "Arabian", "Cam Tu", "Coach Son", "Review"],
          ["H-004", "MC-663841", "Night Sprint", "6", "Horse", "Thoroughbred", "Hoang Anh", "Coach Bao", "Ready"],
          ["H-005", "MC-447712", "Silver Wind", "4", "Mare", "Warmblood", "Bao Nguyen", "Coach Linh", "Injured"],
        ],
      },
      {
        title: "Horse registry — Pedigree",
        columns: ["Horse ID", "Name", "Sire (Father)", "Dam (Mother)", "Distance pref.", "Surface pref.", "Stud farm"],
        rows: [
          ["H-001", "Storm Arrow", "Thunder King", "Arrow Queen", "Short (1000–1400m)", "Turf", "Saigon Stud"],
          ["H-002", "Blue Horizon", "Sea Breeze", "Calm Waters", "Long (2000m+)", "Dirt", "Hanoi Farm"],
          ["H-003", "Golden Mane", "Gold Rush", "Lady Luck", "Mid (1400–1800m)", "Turf", "Da Nang Ranch"],
          ["H-004", "Night Sprint", "Dark Comet", "Night Star", "Short (1000–1400m)", "Turf", "Saigon Stud"],
          ["H-005", "Silver Wind", "Silver Bolt", "Wind Song", "Mid (1600–2000m)", "Dirt", "Hanoi Farm"],
        ],
      },
      {
        title: "Horse registry — Physical & Health",
        columns: ["Horse ID", "Name", "Weight (kg)", "Height (hands)", "Last shoed", "Shoe type", "Health status"],
        rows: [
          ["H-001", "Storm Arrow", "512", "16.1", "2026-05-20", "Aluminium", "Ready"],
          ["H-002", "Blue Horizon", "534", "16.3", "2026-05-18", "Steel", "Ready"],
          ["H-003", "Golden Mane", "498", "15.3", "2026-05-10", "Steel", "Review"],
          ["H-004", "Night Sprint", "521", "16.0", "2026-05-22", "Aluminium", "Ready"],
          ["H-005", "Silver Wind", "509", "16.2", "2026-04-30", "Steel", "Injured"],
        ],
      },
      {
        title: "Horse registry — Performance & Training",
        columns: ["Horse ID", "Name", "Max speed (km/h)", "200m split (s)", "Heart rate peak (bpm)", "Recovery time (s)", "Stride length (m)", "Stride freq. (spm)"],
        rows: [
          ["H-001", "Storm Arrow", "68.4", "10.58", "228", "42", "7.8", "138"],
          ["H-002", "Blue Horizon", "65.2", "11.04", "221", "51", "7.4", "132"],
          ["H-003", "Golden Mane", "61.8", "11.62", "216", "58", "7.1", "128"],
          ["H-004", "Night Sprint", "70.1", "10.27", "235", "38", "8.0", "142"],
          ["H-005", "Silver Wind", "63.5", "11.35", "219", "49", "7.2", "130"],
        ],
      },
      {
        title: "Horse registry — Race History & Points",
        columns: ["Horse ID", "Name", "Starts", "1st", "2nd", "3rd", "Career pts", "Handicap rating", "Extra weight (kg)"],
        rows: [
          ["H-001", "Storm Arrow", "10", "4", "3", "1", "1,840 pts", "112", "2.0"],
          ["H-002", "Blue Horizon", "12", "3", "4", "2", "1,620 pts", "108", "1.5"],
          ["H-003", "Golden Mane", "4", "1", "0", "1", "480 pts", "90", "0.0"],
          ["H-004", "Night Sprint", "8", "5", "2", "0", "2,100 pts", "118", "3.0"],
          ["H-005", "Silver Wind", "6", "1", "2", "1", "740 pts", "94", "0.0"],
        ],
      },
    ],
  },
  schedule: {
    title: "Schedule",
    eyebrow: "Race calendar",
    description:
      "Plan tournament rounds, race order, and published time slots while keeping all participants aligned with the race calendar.",
    primaryActions: ["Create race", "Publish slot", "Assign referee"],
    filters: {
      searchPlaceholder: "Search race, tournament, round, referee...",
      statusOptions: ["All", "Published", "Draft"],
    },
    summary: [
      { label: "Upcoming races", value: "14" },
      { label: "Published slots", value: "11" },
      { label: "Draft rounds", value: "03" },
    ],
    sections: [
      {
        title: "Race planning",
        items: [
          "Build heats, rounds, and finals.",
          "Assign horses and jockeys to race slots.",
          "Coordinate venue, sequence, and timing.",
        ],
      },
      {
        title: "Live operations",
        items: [
          "Update race state during the event.",
          "Publish changes to spectators and participants.",
          "Adjust order when referees request changes.",
        ],
      },
    ],
    tools: [
      {
        title: "Calendar view",
        content: "Switch between day, week, and month layouts to manage race timing more visually.",
      },
      {
        title: "Drag & drop order",
        content: "Move races between rounds and adjust sequence before publication.",
      },
    ],
    tables: [
      {
        title: "Race schedule",
        columns: ["Race", "Tournament", "Date", "Round", "Referee", "Status"],
        rows: [
          ["R-01", "Spring Cup 2026", "2026-06-03", "Heat 1", "Le Quang", "Published"],
          ["R-02", "Spring Cup 2026", "2026-06-03", "Heat 2", "Thu Trang", "Published"],
          ["R-03", "Spring Cup 2026", "2026-06-04", "Semi-final", "Minh Tu", "Draft"],
          ["R-04", "Spring Cup 2026", "2026-06-05", "Final", "Hong Son", "Draft"],
        ],
      },
    ],
  },
  results: {
    title: "Results",
    eyebrow: "Race outcomes",
    description:
      "Publish race results, rankings, prize outcomes, and verified referee reports for each completed race.",
    primaryActions: ["Publish result", "Verify report", "Update ranking"],
    filters: {
      searchPlaceholder: "Search race, winner, prize, report...",
      statusOptions: ["All", "Confirmed", "Pending"],
    },
    summary: [
      { label: "Verified results", value: "42" },
      { label: "Prize claims", value: "09" },
      { label: "Reports filed", value: "27" },
    ],
    sections: [
      {
        title: "Result publication",
        items: [
          "Confirm final placement and official time.",
          "Publish leaderboard updates.",
          "Notify owners, jockeys, and spectators.",
        ],
      },
      {
        title: "Prize tracking",
        items: [
          "Record prize allocation and status.",
          "Link results to betting and prediction outcomes.",
          "Store final verification notes.",
        ],
      },
    ],
    tools: [
      {
        title: "Result approval queue",
        content: "Let admin verify submitted results before the public leaderboard is updated.",
      },
      {
        title: "Publish controls",
        content: "Show a draft/published state so result announcements can be reviewed first.",
      },
    ],
    tables: [
      {
        title: "Official results",
        columns: ["Race", "Winner", "Time", "Points awarded", "Referee report"],
        rows: [
          ["R-01", "Storm Arrow", "1:41.28", "500 pts", "Confirmed"],
          ["R-02", "Blue Horizon", "1:39.84", "500 pts", "Confirmed"],
          ["R-05", "Night Sprint", "1:38.02", "750 pts", "Pending"],
          ["R-06", "Silver Wind", "1:40.11", "500 pts", "Confirmed"],
        ],
      },
    ],
  },
  registrations: {
    title: "Registrations",
    eyebrow: "Race entry approval",
    description:
      "Review horse race registrations from owners before the horse can proceed to jockey invitation and race participation.",
    primaryActions: ["Approve entry", "Reject entry", "Review details"],
    filters: {
      searchPlaceholder: "Search reg ID, participant, role, target...",
      statusOptions: ["All", "Approved", "Pending", "Review"],
    },
    summary: [
      { label: "Waiting approval", value: "21" },
      { label: "Processed today", value: "13" },
      { label: "Flagged items", value: "04" },
    ],
    sections: [
      {
        title: "Race entry review",
        items: [
          "Check horse identity and owner context.",
          "Verify race eligibility before approval.",
          "Send approval or rejection feedback.",
        ],
      },
      {
        title: "Queue control",
        items: [
          "Prioritize race-critical approvals.",
          "Monitor pending horse race entries.",
          "Keep a log of all actions.",
        ],
      },
    ],
    tools: [
      {
        title: "Approval inbox",
        content: "List horse race registrations with approve/reject actions so admins can process them one by one.",
      },
      {
        title: "Eligibility review",
        content: "Surface horse, owner, race, and tournament context before admin approval.",
      },
    ],
    tables: [
      {
        title: "Registration queue",
        columns: ["Reg ID", "Participant", "Role", "Target", "Submitted", "Status"],
        rows: [
          ["REG-201", "Storm Arrow", "Horse Race Entry", "Spring Cup / Heat 1", "Today 08:15", "Approved"],
          ["REG-202", "Blue Horizon", "Horse Race Entry", "Spring Cup / Heat 2", "Today 08:20", "Pending"],
          ["REG-203", "Golden Mane", "Horse Race Entry", "Derby Trial / Final", "Today 08:31", "Approved"],
          ["REG-204", "Silver Wind", "Horse Race Entry", "Derby Trial / Heat 1", "Today 09:02", "Review"],
        ],
      },
    ],
  },
  jockeys: {
    title: "Jockeys",
    eyebrow: "Jockey management",
    description:
      "Manage jockey profiles, physical condition, medical clearance, performance metrics, discipline history, and race assignments across the tournament.",
    primaryActions: ["Invite jockey", "Assign race", "Review performance"],
    filters: {
      searchPlaceholder: "Search jockey, horse, clearance, violation, suspension...",
      statusOptions: ["All", "Active", "Invited", "Pending", "Suspended", "Medical hold"],
    },
    summary: [
      { label: "Licensed jockeys", value: "32" },
      { label: "Race assigned", value: "19" },
      { label: "Under medical review", value: "03" },
    ],
    sections: [
      {
        title: "Physical & Health",
        items: [
          "Track official weight check before and after each race day.",
          "Store injury history, recovery progress, and current health condition.",
          "Store medical clearance issued by the medical board.",
        ],
      },
      {
        title: "Performance & Form",
        items: [
          "Track win rate percentage from total starts and wins.",
          "Show track/surface or distance preference performance splits.",
          "Keep race-by-race form and recent finishes visible for selection.",
        ],
      },
      {
        title: "Discipline & Compliance",
        items: [
          "Record whip violations, careless riding, and start faults.",
          "Track suspension days and current serving status.",
          "Store random drug/alcohol test records and outcomes.",
        ],
      },
    ],
    tools: [
      {
        title: "Weight control",
        content: "Compare official weight against allowed race limit and flag weight-out cases instantly.",
      },
      {
        title: "Medical clearance",
        content: "Show clearance validity, injury recovery state, and doctor approval in one compact panel.",
      },
      {
        title: "Violation tracker",
        content: "Summarize whip, riding, suspension, and testing history before assigning a jockey.",
      },
    ],
    tables: [
      {
        title: "Jockey roster — profile",
        columns: ["Jockey ID", "Name", "Weight", "Medical clearance", "Status"],
        rows: [
          ["J-11", "Anh Khoa", "53.2 kg", "Valid until 2026-06-12", "Active"],
          ["J-12", "Le Nam", "52.4 kg", "Valid until 2026-06-08", "Invited"],
          ["J-13", "Phuong Vy", "54.1 kg", "Pending review", "Medical hold"],
          ["J-14", "Duc Huy", "55.0 kg", "Valid until 2026-06-20", "Suspended"],
        ],
      },
      {
        title: "Jockey roster — performance",
        columns: ["Jockey ID", "Name", "Starts", "Wins", "Win rate", "Turf form", "Dirt form", "Distance form"],
        rows: [
          ["J-11", "Anh Khoa", "18", "6", "33%", "Strong", "Average", "Best at 1200-1600m"],
          ["J-12", "Le Nam", "22", "9", "41%", "Average", "Strong", "Best at 1800m+"],
          ["J-13", "Phuong Vy", "9", "2", "22%", "Strong", "Average", "Best at sprint"],
          ["J-14", "Duc Huy", "14", "4", "29%", "Average", "Weak", "Best at 1400m"],
        ],
      },
      {
        title: "Jockey roster — discipline",
        columns: ["Jockey ID", "Name", "Violations", "Suspension days", "Drug/alcohol tests", "Last test result"],
        rows: [
          ["J-11", "Anh Khoa", "1", "0", "4", "Negative"],
          ["J-12", "Le Nam", "0", "0", "5", "Negative"],
          ["J-13", "Phuong Vy", "2", "7", "3", "Negative"],
          ["J-14", "Duc Huy", "4", "14", "6", "Negative"],
        ],
      },
    ],
  },
  referees: {
    title: "Referees",
    eyebrow: "Race officials",
    description:
      "Assign referees to races, inspect horses before competition, manage conflict-of-interest declarations, and confirm final results with official reports.",
    primaryActions: ["Assign referee", "Add report", "Confirm result"],
    filters: {
      searchPlaceholder: "Search referee, level, race, report status...",
      statusOptions: ["All", "Confirmed", "Filed", "Pending", "Draft"],
    },
    summary: [
      { label: "Available referees", value: "11" },
      { label: "Active assignments", value: "08" },
      { label: "Reports pending", value: "05" },
    ],
    sections: [
      {
        title: "Identification & Accreditation",
        items: [
          "Track referee licensing level: IFHA international, national, or local track accreditation.",
          "Store referee identity, jurisdiction, and event assignment history.",
          "Display current role eligibility before a referee is assigned to a race.",
        ],
      },
      {
        title: "Conflict of Interest",
        items: [
          "Declare no family relationship with any horse owner, trainer, or jockey in the tournament.",
          "Block referees who hold shares, sponsorship, or betting ties related to the event.",
          "Show conflict clearance status before final assignment.",
        ],
      },
      {
        title: "Performance & Decision Making",
        items: [
          "Track number of races officiated and overall officiating experience.",
          "Record decision time from inquiry / objection to final ruling after video or photo review.",
          "Monitor consistency and turnaround speed for race verdicts.",
        ],
      },
    ],
    tools: [
      {
        title: "Assignment planner",
        content: "Pick a referee per race and show current workload, level, and conflict clearance before confirming assignment.",
      },
      {
        title: "Conflict checker",
        content: "Review family, ownership, sponsorship, and betting disclosures before allowing a referee to officiate.",
      },
      {
        title: "Decision tracker",
        content: "Measure officiating speed from inquiry to final decision, including replay and photo-finish review time.",
      },
    ],
    tables: [
      {
        title: "Referee roster — accreditation",
        columns: ["Referee ID", "Name", "Level", "Events officiated", "Conflict status", "Assigned race"],
        rows: [
          ["RF-01", "Le Quang", "National", "48", "Clear", "R-01"],
          ["RF-02", "Thu Trang", "IFHA", "76", "Clear", "R-02"],
          ["RF-03", "Minh Tu", "Local", "19", "Review", "R-03"],
          ["RF-04", "Hong Son", "National", "54", "Clear", "R-04"],
        ],
      },
      {
        title: "Referee roster — performance",
        columns: ["Referee ID", "Name", "Matches officiated", "Inquiry handling", "Decision time", "Replay used"],
        rows: [
          ["RF-01", "Le Quang", "48", "Fast", "42 sec", "Yes"],
          ["RF-02", "Thu Trang", "76", "Very fast", "28 sec", "Yes"],
          ["RF-03", "Minh Tu", "19", "Moderate", "61 sec", "No"],
          ["RF-04", "Hong Son", "54", "Fast", "35 sec", "Yes"],
        ],
      },
      {
        title: "Referee roster — decision log",
        columns: ["Referee ID", "Race", "Inquiry", "Video review", "Final ruling", "Decision time"],
        rows: [
          ["RF-01", "R-01", "False start objection", "Checked", "Disqualified", "42 sec"],
          ["RF-02", "R-02", "Photo finish review", "Checked", "Winner confirmed", "28 sec"],
          ["RF-03", "R-03", "Lane interference claim", "Not required", "Warning issued", "61 sec"],
          ["RF-04", "R-04", "Jockey contact inquiry", "Checked", "Penalty applied", "35 sec"],
        ],
      },
    ],
  },
  predictions: {
    title: "Predictions",
    eyebrow: "Prediction management",
    description:
      "Manage spectator predictions, bet logs, ranking outcomes, and prize tracking tied to each race result.",
    primaryActions: ["Review bets", "Publish odds", "Award prize"],
    filters: {
      searchPlaceholder: "Search bet, spectator, race, outcome...",
      statusOptions: ["All", "Win", "Lose", "Pending"],
    },
    summary: [
      { label: "Prediction entries", value: "156" },
      { label: "Winning picks", value: "38" },
      { label: "Prize payouts", value: "12" },
    ],
    sections: [
      {
        title: "Prediction flow",
        items: [
          "Track spectator picks before race start.",
          "Link results to prediction outcomes.",
          "Monitor prize eligibility and history.",
        ],
      },
      {
        title: "Outcome tracking",
        items: [
          "Compare predictions with official results.",
          "Generate reward summaries.",
          "Keep betting activity auditable.",
        ],
      },
    ],
    tools: [
      {
        title: "Prediction review",
        content: "Show a moderation panel for reviewing prediction entries before prize distribution.",
      },
      {
        title: "Prize summary",
        content: "Summarize payouts and winning picks per race for admin visibility.",
      },
    ],
    tables: [
      {
        title: "Prediction log",
        columns: ["Bet ID", "Spectator", "Race", "Pick", "Odds", "Outcome", "Points earned"],
        rows: [
          ["BET-301", "Ngoc Anh", "R-01", "Storm Arrow", "3.2×", "Win", "320 pts"],
          ["BET-302", "Phuong Mai", "R-02", "Blue Horizon", "4.1×", "Win", "410 pts"],
          ["BET-303", "Quoc Bao", "R-05", "Night Sprint", "2.8×", "Pending", "-"],
          ["BET-304", "Thanh Ha", "R-06", "Silver Wind", "5.0×", "Lose", "0 pts"],
        ],
      },
    ],
  },
  tournament: {
    title: "Tournament Setup",
    eyebrow: "Tournament planning",
    description:
      "Create the tournament structure, set race rounds and publish the complete event schedule for the season.",
    primaryActions: ["Create tournament", "Add round", "Publish plan"],
    filters: {
      searchPlaceholder: "Search tournament, venue, round, status...",
      statusOptions: ["All", "Active", "Draft", "Planning"],
    },
    summary: [
      { label: "Season tournaments", value: "03" },
      { label: "Rounds configured", value: "18" },
      { label: "Draft updates", value: "06" },
    ],
    sections: [
      {
        title: "Event structure",
        items: [
          "Define tournament phases and race rounds.",
          "Set dates, venue, and publishing rules.",
          "Coordinate with registration and result flows.",
        ],
      },
      {
        title: "Publishing",
        items: [
          "Release schedule to all roles.",
          "Update rounds when changes happen.",
          "Keep a master event plan for the admin team.",
        ],
      },
    ],
    tools: [
      {
        title: "Round builder",
        content: "Visually assemble heats, semi-finals, and finals in a structured tournament flow.",
      },
      {
        title: "Publish checklist",
        content: "Show pre-publish validation so admins can confirm all required data is ready.",
      },
    ],
    tables: [
      {
        title: "Tournament plan",
        columns: ["Tournament ID", "Season", "Venue", "Rounds", "Published", "Status"],
        rows: [
          ["T-2026-01", "Spring Cup 2026", "Grandstand District", "12", "Yes", "Active"],
          ["T-2026-02", "Summer Derby 2026", "North Track", "10", "No", "Draft"],
          ["T-2026-03", "Autumn Classic 2026", "West Arena", "8", "No", "Planning"],
        ],
      },
    ],
  },
};
