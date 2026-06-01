import { useState } from "react";
import { Activity, CalendarDays, Crown, Flag, Flame, MapPin, Medal, Star, Trophy, UsersRound } from "lucide-react";
import SearchFilterBar from "../../components/SearchFilterBar.jsx";
import DataTable from "../../components/DataTable.jsx";
import { tournaments } from "./tournamentData.js";
import "./spectator.css";

const HORSE_IMAGES = [
  "https://i.pinimg.com/236x/34/b4/a8/34b4a897a11e246d4e7d97a2981c22b1.jpg",
  "https://i.pinimg.com/236x/ab/6b/71/ab6b714886cbdfbe68e6c9e016060ae9.jpg",
  "https://i.pinimg.com/474x/86/9b/90/869b907e8b730e84c65df991bad2203d.jpg",
  "https://i.pinimg.com/474x/2a/70/02/2a70023b9e1bd8059b82a4449d2041a7.jpg",
];

const JOCKEY_IMAGES = [
  "https://i.pinimg.com/736x/a2/e7/b3/a2e7b3dccfe145267b1636019407c5c9.jpg",
  "https://i.pinimg.com/736x/04/a0/65/04a065ab76b7d7373985d2cab24918ac.jpg",
  "https://i.pinimg.com/1200x/5c/76/3f/5c763f80950f605924fd9975347a4ca9.jpg",
  "https://i.pinimg.com/1200x/16/e8/ea/16e8ea543e1740ed400f4ae13d8c10d4.jpg",
];

const MOCK_HORSES = [
  { rank: 1, name: "Thunderbolt", owner: "Minh Le", jockey: "Alex Rider", wins: 12, starts: 18, prizeMoney: "$250,000", rating: "S", form: "64%", signal: "+8.4", image: HORSE_IMAGES[0] },
  { rank: 2, name: "Silver Flash", owner: "Aisha Moreno", jockey: "Chris Evans", wins: 10, starts: 17, prizeMoney: "$180,000", rating: "A+", form: "58%", signal: "+5.7", image: HORSE_IMAGES[1] },
  { rank: 3, name: "Golden Gallop", owner: "Tuan Pham", jockey: "Elena Gilbert", wins: 8, starts: 15, prizeMoney: "$120,000", rating: "A", form: "53%", signal: "+3.2", image: HORSE_IMAGES[2] },
  { rank: 4, name: "Midnight Run", owner: "Nora Bennett", jockey: "David Miller", wins: 7, starts: 16, prizeMoney: "$90,000", rating: "A", form: "49%", signal: "-1.6", image: HORSE_IMAGES[3] },
  { rank: 5, name: "Storm Chaser", owner: "Harvey Tran", jockey: "Frank Castle", wins: 6, starts: 14, prizeMoney: "$75,000", rating: "B+", form: "46%", signal: "+1.8", image: HORSE_IMAGES[0] },
  { rank: 6, name: "Crimson Comet", owner: "Rachel Nguyen", jockey: "Maya Chen", wins: 6, starts: 13, prizeMoney: "$68,000", rating: "B+", form: "44%", signal: "-2.1", image: HORSE_IMAGES[1] },
  { rank: 7, name: "Emerald Arrow", owner: "Louis Park", jockey: "Noah Bennett", wins: 5, starts: 12, prizeMoney: "$54,000", rating: "B", form: "41%", signal: "+0.9", image: HORSE_IMAGES[2] },
  { rank: 8, name: "Velvet Horizon", owner: "Donna Reyes", jockey: "Sofia Reyes", wins: 4, starts: 11, prizeMoney: "$42,000", rating: "B", form: "38%", signal: "-3.4", image: HORSE_IMAGES[3] },
];

const MOCK_JOCKEYS = [
  { rank: 1, name: "Alex Rider", wins: 15, starts: 23, experience: "10 yrs", winRate: "65%", rating: "Legendary", signal: "+7.9", image: JOCKEY_IMAGES[0] },
  { rank: 2, name: "Chris Evans", wins: 12, starts: 21, experience: "8 yrs", winRate: "58%", rating: "Elite", signal: "+4.8", image: JOCKEY_IMAGES[1] },
  { rank: 3, name: "David Miller", wins: 11, starts: 21, experience: "12 yrs", winRate: "52%", rating: "Elite", signal: "+2.6", image: JOCKEY_IMAGES[2] },
  { rank: 4, name: "Elena Gilbert", wins: 9, starts: 19, experience: "5 yrs", winRate: "48%", rating: "Pro", signal: "+1.1", image: JOCKEY_IMAGES[3] },
  { rank: 5, name: "Frank Castle", wins: 8, starts: 19, experience: "15 yrs", winRate: "42%", rating: "Pro", signal: "-0.8", image: JOCKEY_IMAGES[0] },
  { rank: 6, name: "Maya Chen", wins: 7, starts: 18, experience: "6 yrs", winRate: "39%", rating: "Pro", signal: "-1.9", image: JOCKEY_IMAGES[1] },
  { rank: 7, name: "Noah Bennett", wins: 6, starts: 17, experience: "7 yrs", winRate: "35%", rating: "Rising", signal: "+0.5", image: JOCKEY_IMAGES[2] },
  { rank: 8, name: "Sofia Reyes", wins: 5, starts: 15, experience: "4 yrs", winRate: "33%", rating: "Rising", signal: "-2.7", image: JOCKEY_IMAGES[3] },
];

const TOURNAMENT_BOARD = tournaments
  .filter((tournament) => tournament.status !== "Completed")
  .slice(0, 4);

const Podium = ({ data, type }) => {
  const topThree = [data[1], data[0], data[2]].filter(Boolean);
  const isHorse = type === "horses";

  return (
    <div className="lb-podium">
      {topThree.map((item) => (
        <article className={`lb-podium-card lb-podium-card--rank-${item.rank}`} key={item.name}>
          <div className="lb-podium-card__rank">{item.rank === 1 ? "1st" : item.rank === 2 ? "2nd" : "3rd"}</div>
          <div className="lb-podium-card__image-wrap">
            <img className="lb-podium-card__image" src={item.image} alt={item.name} loading="lazy" />
          </div>
          <div className="lb-podium-card__body">
            <h3>{item.name}</h3>
            <span className="lb-podium-card__meta">
              {isHorse ? `Jockey: ${item.jockey}` : `${item.experience} experience`}
            </span>
            <div className="lb-podium-card__divider" />
            <span className="lb-podium-card__kicker">{isHorse ? "Prize Winnings" : "Win Rate"}</span>
            <strong className="lb-podium-card__value">
              {isHorse ? item.prizeMoney : item.winRate}
            </strong>
            <span className="lb-podium-card__sub">
              {isHorse ? `Owner: ${item.owner}` : `${item.wins} wins from ${item.starts} starts`}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
};

const EntityCell = ({ image, name, meta }) => (
  <div className="lb-entity-cell">
    <img src={image} alt={name} loading="lazy" />
    <div>
      <strong>{name}</strong>
      <span>{meta}</span>
    </div>
  </div>
);

const SignalCell = ({ signal }) => {
  const isPositive = Number(signal) >= 0;

  return (
    <span className={`lb-signal ${isPositive ? "lb-signal--positive" : "lb-signal--negative"}`}>
      {signal}
    </span>
  );
};

const TournamentRail = ({ selectedTournament, onSelect }) => (
  <div className="lb-tournament-rail" aria-label="Tournament leaderboard context">
    <div className="lb-tournament-rail__header">
      <span className="lb-badge lb-badge--ghost"><Flag size={13} /> Tournament context</span>
      <strong>{selectedTournament.name}</strong>
    </div>
    <div className="lb-tournament-rail__meta">
      <span><MapPin size={14} /> {selectedTournament.location}</span>
      <span><CalendarDays size={14} /> {selectedTournament.date}</span>
      <span><Trophy size={14} /> {selectedTournament.prize}</span>
      <span><Flag size={14} /> {selectedTournament.track} / {selectedTournament.distance}</span>
    </div>
    <div className="lb-tournament-rail__list">
      {TOURNAMENT_BOARD.map((tournament) => (
        <button
          className={`lb-tournament-chip ${selectedTournament.id === tournament.id ? "lb-tournament-chip--active" : ""}`}
          key={tournament.id}
          type="button"
          onClick={() => onSelect(tournament.id)}
        >
          <span>{tournament.status}</span>
          <strong>{tournament.name}</strong>
        </button>
      ))}
    </div>
  </div>
);

const MetricTile = ({ icon, label, value, sub, accent }) => (
  <article className={`lb-metric ${accent ? `lb-metric--${accent}` : ""}`}>
    <div className="lb-metric__inner">
      {icon}
      <span className="lb-metric__label">{label}</span>
      <strong className="lb-metric__value">{value}</strong>
      <small className="lb-metric__sub">{sub}</small>
    </div>
  </article>
);

const Leaderboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("horses");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [selectedTournamentId, setSelectedTournamentId] = useState(TOURNAMENT_BOARD[0]?.id ?? tournaments[0].id);

  const activeData = activeTab === "horses" ? MOCK_HORSES : MOCK_JOCKEYS;
  const isHorseBoard = activeTab === "horses";
  const selectedTournament = TOURNAMENT_BOARD.find((tournament) => tournament.id === selectedTournamentId) ?? TOURNAMENT_BOARD[0];
  const leader = activeData[0];
  const totalWins = activeData.reduce((sum, item) => sum + item.wins, 0);
  const totalStarts = activeData.reduce((sum, item) => sum + item.starts, 0);
  const averageWinRate = Math.round((totalWins / totalStarts) * 100);

  const leaderboardFilters = [
    { value: "all", label: "All ranks" },
    { value: "elite", label: isHorseBoard ? "Elite ratings" : "Elite riders" },
    { value: "high-wins", label: "High wins" },
    { value: "watchlist", label: "Watchlist" },
  ];

  const filteredData = activeData.filter((item) => {
    const normalizedQuery = searchQuery.toLowerCase();
    const searchableText = [item.name, item.owner, item.jockey, item.rating, item.experience]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(normalizedQuery);
    const matchesFilter =
      performanceFilter === "all" ||
      (performanceFilter === "elite" && ["S", "A+", "Legendary", "Elite"].includes(item.rating)) ||
      (performanceFilter === "high-wins" && item.wins >= (isHorseBoard ? 8 : 10)) ||
      (performanceFilter === "watchlist" && item.rank > 3);

    return matchesSearch && matchesFilter;
  });

  const horseColumns = [
    { header: "Rank", field: "rank", render: (row) => <span className="lb-table-rank">#{row.rank}</span> },
    { header: "Horse", field: "name", render: (row) => <EntityCell image={row.image} name={row.name} meta={`Owner: ${row.owner}`} /> },
    { header: "Wins", field: "wins" },
    { header: "Starts", field: "starts" },
    { header: "Form", field: "form" },
    { header: "Signal", field: "signal", render: (row) => <SignalCell signal={row.signal} /> },
    { header: "Prize Money", field: "prizeMoney" },
    { header: "Rating", field: "rating", render: (row) => <span className="lb-badge">{row.rating}</span> },
  ];

  const jockeyColumns = [
    { header: "Rank", field: "rank", render: (row) => <span className="lb-table-rank">#{row.rank}</span> },
    { header: "Jockey", field: "name", render: (row) => <EntityCell image={row.image} name={row.name} meta={`${row.experience} experience`} /> },
    { header: "Wins", field: "wins" },
    { header: "Starts", field: "starts" },
    { header: "Win Rate", field: "winRate" },
    { header: "Signal", field: "signal", render: (row) => <SignalCell signal={row.signal} /> },
    { header: "Rating", field: "rating", render: (row) => <span className="lb-badge">{row.rating}</span> },
  ];

  return (
    <section className="lb-page">
      <nav className="lb-tabs lb-tabs--top" role="tablist" aria-label="Leaderboard type">
        <button
          className={`lb-tab ${activeTab === "horses" ? "lb-tab--active" : ""}`}
          type="button"
          onClick={() => setActiveTab("horses")}
          role="tab"
          aria-selected={activeTab === "horses"}
        >
          <Trophy size={16} />
          Horses
        </button>
        <button
          className={`lb-tab ${activeTab === "jockeys" ? "lb-tab--active" : ""}`}
          type="button"
          onClick={() => setActiveTab("jockeys")}
          role="tab"
          aria-selected={activeTab === "jockeys"}
        >
          <Medal size={16} />
          Jockeys
        </button>
      </nav>

      <div className="lb-hero">
        <div className="lb-hero__copy">
          <p className="lb-eyebrow">Tournament leaderboard</p>
          <h1 className="lb-title">Know who&rsquo;s leading before the next race window opens.</h1>
          <p className="lb-copy">Compare form, wins, starts, ratings, and prize performance across the active field.</p>
          <div className="lb-hero__meta" aria-label="Leaderboard summary">
            <span><Activity size={15} /> {selectedTournament.status}</span>
            <span><UsersRound size={15} /> {activeData.length} ranked</span>
            <span><Trophy size={15} /> {totalWins} wins logged</span>
          </div>
        </div>
        <aside className="lb-leader-card">
          <div className="lb-leader-card__image-wrap">
            <img className="lb-leader-card__image" src={leader.image} alt={leader.name} />
          </div>
          <div className="lb-leader-card__body">
            <span className="lb-leader-card__label">Current leader</span>
            <strong className="lb-leader-card__name">{leader.name}</strong>
            <span className="lb-leader-card__stat">{leader.wins} wins / {leader.starts} starts</span>
            <span className="lb-badge lb-badge--accent"><Crown size={13} /> Rank #1</span>
          </div>
        </aside>
      </div>

      <TournamentRail selectedTournament={selectedTournament} onSelect={setSelectedTournamentId} />

      <div className="lb-metrics">
        <MetricTile icon={<Flame size={18} />} label="Win Rate" value={`${averageWinRate}%`} sub="Board average" accent="green" />
        <MetricTile icon={<Activity size={18} />} label="Starts" value={totalStarts} sub="Verified races" />
        <MetricTile icon={<Star size={18} />} label={isHorseBoard ? "Top Form" : "Top Rating"} value={isHorseBoard ? leader.form : leader.rating} sub={leader.name} accent="amber" />
        <MetricTile icon={<UsersRound size={18} />} label="Tracking" value={filteredData.length} sub="Visible entries" />
      </div>

      <Podium data={activeData} type={activeTab} />

      <div className="lb-table-section">
        <div className="lb-table-section__header">
          <div>
            <span className="lb-badge lb-badge--ghost"><Star size={13} /> Ranking board</span>
            <h2>{isHorseBoard ? "Horse performance table" : "Jockey performance table"}</h2>
          </div>
          <span className="lb-table-section__count">{filteredData.length} of {activeData.length} shown</span>
        </div>

        <SearchFilterBar
          onSearch={setSearchQuery}
          onFilterChange={setPerformanceFilter}
          initialValue={searchQuery}
          placeholder={isHorseBoard ? "Search horse, owner, jockey..." : "Search jockey, rating, experience..."}
          filterOptions={leaderboardFilters}
        />

        <DataTable
          columns={activeTab === "horses" ? horseColumns : jockeyColumns}
          data={filteredData}
          emptyMessage="No entries found."
        />
      </div>
    </section>
  );
};

export default Leaderboard;
