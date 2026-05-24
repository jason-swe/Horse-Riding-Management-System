export const adminModules = {
  users: {
    title: "Users & Roles",
    eyebrow: "User management",
    description:
      "Manage accounts for Horse Owner, Jockey, Race Referee, Spectator, and Admin roles. Assign permissions, review account status, and keep access aligned with tournament operations.",
    primaryActions: ["Create account", "Assign role", "Suspend user"],
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
