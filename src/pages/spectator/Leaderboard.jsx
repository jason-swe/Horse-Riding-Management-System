import { useState } from "react";
import SearchFilterBar from "../../components/SearchFilterBar.jsx";
import DataTable from "../../components/DataTable.jsx";
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
  { rank: 1, name: "Thunderbolt", owner: "John Doe", jockey: "Alex Rider", wins: 12, starts: 18, prizeMoney: "$250,000", rating: "S", form: "64%", image: HORSE_IMAGES[0] },
  { rank: 2, name: "Silver Flash", owner: "Jane Smith", jockey: "Chris Evans", wins: 10, starts: 17, prizeMoney: "$180,000", rating: "A+", form: "58%", image: HORSE_IMAGES[1] },
  { rank: 3, name: "Golden Gallop", owner: "Mike Ross", jockey: "Elena Gilbert", wins: 8, starts: 15, prizeMoney: "$120,000", rating: "A", form: "53%", image: HORSE_IMAGES[2] },
  { rank: 4, name: "Midnight Run", owner: "Sarah Connor", jockey: "David Miller", wins: 7, starts: 16, prizeMoney: "$90,000", rating: "A", form: "49%", image: HORSE_IMAGES[3] },
  { rank: 5, name: "Storm Chaser", owner: "Harvey Specter", jockey: "Frank Castle", wins: 6, starts: 14, prizeMoney: "$75,000", rating: "B+", form: "46%", image: HORSE_IMAGES[0] },
  { rank: 6, name: "Crimson Comet", owner: "Rachel Zane", jockey: "Maya Chen", wins: 6, starts: 13, prizeMoney: "$68,000", rating: "B+", form: "44%", image: HORSE_IMAGES[1] },
  { rank: 7, name: "Emerald Arrow", owner: "Louis Litt", jockey: "Noah Bennett", wins: 5, starts: 12, prizeMoney: "$54,000", rating: "B", form: "41%", image: HORSE_IMAGES[2] },
  { rank: 8, name: "Velvet Horizon", owner: "Donna Paulsen", jockey: "Sofia Reyes", wins: 4, starts: 11, prizeMoney: "$42,000", rating: "B", form: "38%", image: HORSE_IMAGES[3] },
];

const MOCK_JOCKEYS = [
  { rank: 1, name: "Alex Rider", wins: 15, starts: 23, experience: "10 yrs", winRate: "65%", rating: "Legendary", image: JOCKEY_IMAGES[0] },
  { rank: 2, name: "Chris Evans", wins: 12, starts: 21, experience: "8 yrs", winRate: "58%", rating: "Elite", image: JOCKEY_IMAGES[1] },
  { rank: 3, name: "David Miller", wins: 11, starts: 21, experience: "12 yrs", winRate: "52%", rating: "Elite", image: JOCKEY_IMAGES[2] },
  { rank: 4, name: "Elena Gilbert", wins: 9, starts: 19, experience: "5 yrs", winRate: "48%", rating: "Pro", image: JOCKEY_IMAGES[3] },
  { rank: 5, name: "Frank Castle", wins: 8, starts: 19, experience: "15 yrs", winRate: "42%", rating: "Pro", image: JOCKEY_IMAGES[0] },
  { rank: 6, name: "Maya Chen", wins: 7, starts: 18, experience: "6 yrs", winRate: "39%", rating: "Pro", image: JOCKEY_IMAGES[1] },
  { rank: 7, name: "Noah Bennett", wins: 6, starts: 17, experience: "7 yrs", winRate: "35%", rating: "Rising", image: JOCKEY_IMAGES[2] },
  { rank: 8, name: "Sofia Reyes", wins: 5, starts: 15, experience: "4 yrs", winRate: "33%", rating: "Rising", image: JOCKEY_IMAGES[3] },
];

const Podium = ({ data, type }) => {
  const topThree = [data[1], data[0], data[2]].filter(Boolean);
  const isHorse = type === "horses";

  return (
    <div className="spectator-podium">
      {topThree.map((item) => (
        <article className={`spectator-podium-card spectator-podium-card--rank-${item.rank}`} key={item.name}>
          <div className={`spectator-podium-label spectator-podium-label--rank-${item.rank}`}>
            {item.rank === 1 ? "WINNER" : `${item.rank === 2 ? "2ND" : "3RD"} PLACE`}
          </div>
          <div className="spectator-podium-avatar">
            <img className="spectator-podium-card__image" src={item.image} alt={item.name} />
          </div>
          <div className="spectator-podium-card__body">
            <h3>{item.name}</h3>
            <span className="spectator-meta">
              {isHorse ? `Jockey: ${item.jockey}` : `${item.experience} experience`}
            </span>
            <div className="spectator-podium-divider" />
            <span className="spectator-podium-kicker">
              {isHorse ? "Prize Winnings" : "Win Rate"}
            </span>
            <strong className="spectator-podium-value">
              {isHorse ? item.prizeMoney : item.winRate}
            </strong>
            <span className="spectator-podium-owner">
              {isHorse ? `Owner: ${item.owner}` : `${item.wins} wins from ${item.starts} starts`}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
};

const EntityCell = ({ image, name, meta }) => (
  <div className="spectator-entity-cell">
    <img src={image} alt={name} />
    <div>
      <strong>{name}</strong>
      <span>{meta}</span>
    </div>
  </div>
);

const Leaderboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("horses");

  const activeData = activeTab === "horses" ? MOCK_HORSES : MOCK_JOCKEYS;
  const filteredData = activeData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const horseColumns = [
    { header: "Rank", field: "rank", render: (row) => <span className="spectator-table-rank">#{row.rank}</span> },
    { header: "Horse", field: "name", render: (row) => <EntityCell image={row.image} name={row.name} meta={`Owner: ${row.owner}`} /> },
    { header: "Wins", field: "wins" },
    { header: "Starts", field: "starts" },
    { header: "Form", field: "form" },
    { header: "Prize Money", field: "prizeMoney" },
    { header: "Rating", field: "rating", render: (row) => <span className="spectator-badge">{row.rating}</span> },
  ];

  const jockeyColumns = [
    { header: "Rank", field: "rank", render: (row) => <span className="spectator-table-rank">#{row.rank}</span> },
    { header: "Jockey", field: "name", render: (row) => <EntityCell image={row.image} name={row.name} meta={`${row.experience} experience`} /> },
    { header: "Wins", field: "wins" },
    { header: "Starts", field: "starts" },
    { header: "Win Rate", field: "winRate" },
    { header: "Rating", field: "rating", render: (row) => <span className="spectator-badge">{row.rating}</span> },
  ];

  return (
    <section className="spectator-page">
      <div className="spectator-hero">
        <div className="spectator-hero__content">
          <p className="spectator-eyebrow">Global Leaderboards</p>
          <h1 className="spectator-title">Top horses and jockeys across the circuit.</h1>
          <p className="spectator-copy">
            Compare form, wins, starts, ratings, and prize performance with equal-sized ranking cards.
          </p>
        </div>
        <aside className="spectator-hero__panel">
          <div className="spectator-live-card">
            <span className="spectator-meta">Current Leader</span>
            <strong>{activeData[0].name}</strong>
            <span>{activeData[0].wins} wins this season</span>
            <span className="spectator-badge spectator-badge--green">Rank #1</span>
          </div>
        </aside>
      </div>

      <div className="spectator-tabs">
        <button
          className={`spectator-tab ${activeTab === "horses" ? "spectator-tab--active" : ""}`}
          type="button"
          onClick={() => setActiveTab("horses")}
        >
          Horses
        </button>
        <button
          className={`spectator-tab ${activeTab === "jockeys" ? "spectator-tab--active" : ""}`}
          type="button"
          onClick={() => setActiveTab("jockeys")}
        >
          Jockeys
        </button>
      </div>

      <Podium data={activeData} type={activeTab} />

      <div style={{ marginTop: "24px" }}>
        <SearchFilterBar
          onSearch={setSearchQuery}
          onFilterChange={() => {}}
          initialValue={searchQuery}
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
