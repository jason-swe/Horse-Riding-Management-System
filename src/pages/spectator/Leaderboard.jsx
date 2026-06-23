import { useState } from "react";
import { Activity, Crown, Medal, Star, Trophy, UsersRound } from "lucide-react";
import SearchFilterBar from "../../components/SearchFilterBar.jsx";
import DataTable from "../../components/DataTable.jsx";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { useSpectatorRaceResults } from "./useSpectatorData.js";
import "./spectator.css";

const Podium = ({ data }) => {
  const topThree = [data[1], data[0], data[2]].filter(Boolean);

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
            <span className="lb-podium-card__meta">Latest rider: {item.jockey}</span>
            <div className="lb-podium-card__divider" />
            <span className="lb-podium-card__kicker">Published wins</span>
            <strong className="lb-podium-card__value">{item.wins}</strong>
            <span className="lb-podium-card__sub">{item.starts} published starts / {item.totalScore} total score</span>
          </div>
        </article>
      ))}
    </div>
  );
};

const EntityCell = ({ image, name, meta }) => (
  <div className="lb-entity-cell">
    <img src={image} alt="" loading="lazy" />
    <div><strong>{name}</strong><span>{meta}</span></div>
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
  const { error, horseLeaderboard, isLoading } = useSpectatorRaceResults();
  const leader = horseLeaderboard[0];
  const totalWins = horseLeaderboard.reduce((sum, item) => sum + item.wins, 0);
  const totalStarts = horseLeaderboard.reduce((sum, item) => sum + item.starts, 0);
  const totalScore = horseLeaderboard.reduce((sum, item) => sum + item.totalScore, 0);
  const averageWinRate = totalStarts ? Math.round((totalWins / totalStarts) * 100) : 0;

  const filteredData = horseLeaderboard.filter((item) => {
    const searchableText = `${item.name} ${item.jockey}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchQuery.toLowerCase());
    const matchesFilter = performanceFilter === "all"
      || (performanceFilter === "winners" && item.wins > 0)
      || (performanceFilter === "multiple-starts" && item.starts > 1);
    return matchesSearch && matchesFilter;
  });

  const columns = [
    { header: "Rank", field: "rank", render: (row) => <span className="lb-table-rank">#{row.rank}</span> },
    { header: "Horse", field: "name", render: (row) => <EntityCell image={row.image} name={row.name} meta={`Latest rider: ${row.jockey}`} /> },
    { header: "Wins", field: "wins" },
    { header: "Starts", field: "starts" },
    { header: "Win rate", field: "winRate" },
    { header: "Total score", field: "totalScore" },
  ];

  if (isLoading) {
    return <section className="lb-page"><LoadingSkeleton ariaLabel="Loading leaderboard" rows={6} variant="table" /></section>;
  }

  return (
    <section className="lb-page">
      {error && (
        <section className="admin-live-state admin-live-state--warning" aria-live="polite">
          {error} No sample rankings are being substituted.
        </section>
      )}

      <nav className="lb-tabs lb-tabs--top" role="tablist" aria-label="Leaderboard type">
        <button className={`lb-tab ${activeTab === "horses" ? "lb-tab--active" : ""}`} type="button" onClick={() => setActiveTab("horses")} role="tab" aria-selected={activeTab === "horses"}>
          <Trophy size={16} /> Horses
        </button>
        <button className={`lb-tab ${activeTab === "jockeys" ? "lb-tab--active" : ""}`} type="button" onClick={() => setActiveTab("jockeys")} role="tab" aria-selected={activeTab === "jockeys"}>
          <Medal size={16} /> Jockeys <span className="lb-tab__note">Unavailable</span>
        </button>
      </nav>

      {activeTab === "jockeys" ? (
        <div className="lb-unavailable" role="status">
          <Medal size={28} />
          <p className="lb-eyebrow">Jockey leaderboard</p>
          <h1>No aggregate jockey ranking is available.</h1>
          <p>The backend publishes jockey data per race result, but it does not provide the profile, experience, rating, or tournament scope required by this board.</p>
          <button type="button" onClick={() => setActiveTab("horses")}>View derived horse form</button>
        </div>
      ) : (
        <>
          <div className="lb-hero">
            <div className="lb-hero__copy">
              <p className="lb-eyebrow">Published result form</p>
              <h1 className="lb-title">Overall horse form from official published finishes.</h1>
              <p className="lb-copy">This board derives wins, starts, win rate, and score across every published result. It is not tournament-specific.</p>
              <div className="lb-hero__meta" aria-label="Leaderboard summary">
                <span><Activity size={15} /> All published races</span>
                <span><UsersRound size={15} /> {horseLeaderboard.length} ranked</span>
                <span><Trophy size={15} /> {totalWins} wins logged</span>
              </div>
            </div>
            {leader ? (
              <aside className="lb-leader-card">
                <div className="lb-leader-card__image-wrap"><img className="lb-leader-card__image" src={leader.image} alt={leader.name} /></div>
                <div className="lb-leader-card__body">
                  <span className="lb-leader-card__label">Derived leader</span>
                  <strong className="lb-leader-card__name">{leader.name}</strong>
                  <span className="lb-leader-card__stat">{leader.wins} wins / {leader.starts} published starts</span>
                  <span className="lb-badge lb-badge--accent"><Crown size={13} /> Rank #1</span>
                </div>
              </aside>
            ) : (
              <aside className="lb-leader-card"><div className="lb-leader-card__body"><span className="lb-leader-card__label">Derived leader</span><strong className="lb-leader-card__name">No ranked entries</strong><span className="lb-leader-card__stat">Published results will build this board.</span></div></aside>
            )}
          </div>

          <div className="lb-metrics">
            <MetricTile icon={<Trophy size={18} />} label="Win rate" value={`${averageWinRate}%`} sub="All published starts" accent="green" />
            <MetricTile icon={<Activity size={18} />} label="Starts" value={totalStarts} sub="Published finishes" />
            <MetricTile icon={<Star size={18} />} label="Total score" value={totalScore} sub="Backend final scores" accent="amber" />
            <MetricTile icon={<UsersRound size={18} />} label="Tracking" value={filteredData.length} sub="Visible horses" />
          </div>

          <Podium data={horseLeaderboard} />

          <div className="lb-table-section">
            <div className="lb-table-section__header">
              <div><span className="lb-badge lb-badge--ghost"><Star size={13} /> Derived ranking</span><h2>Horse performance table</h2></div>
              <span className="lb-table-section__count">{filteredData.length} of {horseLeaderboard.length} shown</span>
            </div>
            <SearchFilterBar
              onSearch={setSearchQuery}
              onFilterChange={setPerformanceFilter}
              initialValue={searchQuery}
              placeholder="Search horse or latest jockey..."
              filterOptions={[
                { value: "all", label: "All horses" },
                { value: "winners", label: "Published winners" },
                { value: "multiple-starts", label: "Multiple starts" },
              ]}
            />
            <DataTable columns={columns} data={filteredData} emptyMessage="No published horse results match this view." />
          </div>
        </>
      )}
    </section>
  );
};

export default Leaderboard;
