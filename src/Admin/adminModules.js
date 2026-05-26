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
      "Maintain horse profiles, racing attributes, registration details, and readiness status for each tournament entry.",
    primaryActions: ["Add horse", "Verify profile", "Set readiness"],
    filters: {
      searchPlaceholder: "Search horse, owner, breed, next race...",
      statusOptions: ["All", "Yes", "No", "Review"],
    },
    summary: [
      { label: "Registered horses", value: "76" },
      { label: "Ready to race", value: "61" },
      { label: "Under review", value: "15" },
    ],
    sections: [
      {
        title: "Horse profile",
        items: [
          "Track horse identity, owner, and registration status.",
          "Record breed, age, weight, and racing indicators.",
          "Flag horses needing referee inspection.",
        ],
      },
      {
        title: "Race readiness",
        items: [
          "Confirm horse eligibility before race day.",
          "Manage race selection and queue status.",
          "Keep tournament entry information up to date.",
        ],
      },
    ],
    tools: [
      {
        title: "Horse search",
        content: "Filter by horse name, owner, breed, and readiness before assigning a race.",
      },
      {
        title: "Inspection notes",
        content: "Show health or referee notes so admin can decide whether the horse can race.",
      },
    ],
    tables: [
      {
        title: "Horse registry",
        columns: ["Horse ID", "Horse name", "Owner", "Breed", "Ready", "Next race"],
        rows: [
          ["H-001", "Storm Arrow", "Minh Le", "Thoroughbred", "Yes", "R-08"],
          ["H-002", "Blue Horizon", "Nhan Tran", "Warmblood", "Yes", "R-03"],
          ["H-003", "Golden Mane", "Cam Tu", "Arabian", "Review", "TBD"],
          ["H-004", "Night Sprint", "Hoang Anh", "Thoroughbred", "Yes", "R-11"],
          ["H-005", "Silver Wind", "Bao Nguyen", "Warmblood", "No", "TBD"],
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
        columns: ["Race", "Winner", "Time", "Prize", "Referee report"],
        rows: [
          ["R-01", "Storm Arrow", "1:41.28", "$3,500", "Confirmed"],
          ["R-02", "Blue Horizon", "1:39.84", "$4,000", "Confirmed"],
          ["R-05", "Night Sprint", "1:38.02", "$5,000", "Pending"],
          ["R-06", "Silver Wind", "1:40.11", "$3,000", "Confirmed"],
        ],
      },
    ],
  },
  registrations: {
    title: "Registrations",
    eyebrow: "Approval queue",
    description:
      "Approve horse owner, jockey, referee, and spectator participation requests before they enter the tournament workflow.",
    primaryActions: ["Approve request", "Reject request", "Review details"],
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
        title: "Request review",
        items: [
          "Check participant identity and role.",
          "Verify horse and jockey data before approval.",
          "Send approval or rejection feedback.",
        ],
      },
      {
        title: "Queue control",
        items: [
          "Prioritize race-critical approvals.",
          "Monitor pending items by role.",
          "Keep a log of all actions.",
        ],
      },
    ],
    tools: [
      {
        title: "Approval inbox",
        content: "List requests with approve/reject actions so admins can process them one by one.",
      },
      {
        title: "Bulk review",
        content: "Support multi-select review for routine accounts and racing participants.",
      },
    ],
    tables: [
      {
        title: "Registration queue",
        columns: ["Reg ID", "Participant", "Role", "Target", "Submitted", "Status"],
        rows: [
          ["REG-201", "Minh Le", "Horse Owner", "Storm Arrow", "Today 08:15", "Approved"],
          ["REG-202", "Anh Khoa", "Jockey", "Blue Horizon", "Today 08:20", "Pending"],
          ["REG-203", "Thanh Ha", "Spectator", "Prediction access", "Today 08:31", "Approved"],
          ["REG-204", "Cam Tu", "Horse Owner", "Golden Mane", "Today 09:02", "Review"],
        ],
      },
    ],
  },
  jockeys: {
    title: "Jockeys",
    eyebrow: "Jockey management",
    description:
      "Manage jockey profiles, invitations, assignments, confirmations, and performance tracking across the tournament.",
    primaryActions: ["Invite jockey", "Assign race", "Review performance"],
    filters: {
      searchPlaceholder: "Search jockey, horse, status, race...",
      statusOptions: ["All", "Active", "Pending", "Invited"],
    },
    summary: [
      { label: "Available jockeys", value: "32" },
      { label: "Assigned today", value: "19" },
      { label: "Pending invites", value: "06" },
    ],
    sections: [
      {
        title: "Assignments",
        items: [
          "Send horse owner invitations.",
          "Track accepted or declined race invites.",
          "Match jockey availability with race slots.",
        ],
      },
      {
        title: "Performance",
        items: [
          "Review personal race history.",
          "Compare rankings and achievements.",
          "Keep jockey participation data current.",
        ],
      },
    ],
    tools: [
      {
        title: "Invitation panel",
        content: "Show pending invites with accept/decline states for quick coordination.",
      },
      {
        title: "Availability check",
        content: "Let admin compare jockey free slots against race dates before assigning.",
      },
    ],
    tables: [
      {
        title: "Jockey assignments",
        columns: ["Jockey ID", "Name", "Assigned horse", "Races", "Wins", "Status"],
        rows: [
          ["J-11", "Anh Khoa", "Blue Horizon", "4", "2", "Active"],
          ["J-12", "Le Nam", "Storm Arrow", "6", "3", "Active"],
          ["J-13", "Phuong Vy", "Night Sprint", "2", "1", "Invited"],
          ["J-14", "Duc Huy", "Silver Wind", "0", "0", "Pending"],
        ],
      },
    ],
  },
  referees: {
    title: "Referees",
    eyebrow: "Race officials",
    description:
      "Assign referees to races, inspect horses before competition, record violations, and confirm final results with official reports.",
    primaryActions: ["Assign referee", "Add report", "Confirm result"],
    filters: {
      searchPlaceholder: "Search referee, race, report status...",
      statusOptions: ["All", "Confirmed", "Filed", "Pending", "Draft"],
    },
    summary: [
      { label: "Available referees", value: "11" },
      { label: "Active assignments", value: "08" },
      { label: "Reports pending", value: "05" },
    ],
    sections: [
      {
        title: "Inspection",
        items: [
          "Inspect horse readiness before races.",
          "Log violations and remarks.",
          "Approve race start conditions.",
        ],
      },
      {
        title: "Reporting",
        items: [
          "File race reports after each event.",
          "Confirm official results and disputes.",
          "Maintain referee history for the record.",
        ],
      },
    ],
    tools: [
      {
        title: "Assignment planner",
        content: "Pick a referee per race and show current workloads before confirming assignment.",
      },
      {
        title: "Violation tracker",
        content: "Capture misconduct notes and inspection details in a compact review panel.",
      },
    ],
    tables: [
      {
        title: "Referee roster",
        columns: ["Referee ID", "Name", "Assigned race", "Violations", "Report status"],
        rows: [
          ["RF-01", "Le Quang", "R-01", "0", "Confirmed"],
          ["RF-02", "Thu Trang", "R-02", "1", "Filed"],
          ["RF-03", "Minh Tu", "R-03", "0", "Pending"],
          ["RF-04", "Hong Son", "R-04", "2", "Draft"],
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
        columns: ["Bet ID", "Spectator", "Race", "Pick", "Odds", "Outcome", "Prize"],
        rows: [
          ["BET-301", "Ngoc Anh", "R-01", "Storm Arrow", "3.2", "Win", "$120"],
          ["BET-302", "Phuong Mai", "R-02", "Blue Horizon", "4.1", "Win", "$210"],
          ["BET-303", "Quoc Bao", "R-05", "Night Sprint", "2.8", "Pending", "-"],
          ["BET-304", "Thanh Ha", "R-06", "Silver Wind", "5.0", "Lose", "$0"],
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