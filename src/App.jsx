import { useEffect, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";

const API_KEY = "005a12d28f4f442fb8b3c3fb5bd51a85";

function Home() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGames();
  }, [search, platform, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [search, platform, sort]);

  function getPlatformId(name) {
    if (name === "pc") return "4";
    if (name === "playstation") return "187";
    if (name === "xbox") return "1";
    if (name === "nintendo") return "7";
    return "";
  }

  function getSortValue(value) {
    if (value === "rating_desc") return "-rating";
    if (value === "rating_asc") return "rating";
    if (value === "date_desc") return "-released";
    if (value === "date_asc") return "released";
    return "";
  }

  async function getGames() {
    setLoading(true);

    let url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=20&page=${page}`;

    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (platform) url += `&platforms=${getPlatformId(platform)}`;
    if (sort) url += `&ordering=${getSortValue(sort)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const results = data.results || [];

      const filtered = search
        ? results.filter((game) =>
            game.name.toLowerCase().includes(search.toLowerCase())
          )
        : results;

      setGames(filtered);
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (error) {
      console.log("Error loading games:", error);
      setGames([]);
    }

    setLoading(false);
  }

  return (
    <>
      <div className="hero">
        <h1>GameRadar</h1>
        <p>Find your next game by search, platform, rating, or release date.</p>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="">All Platforms</option>
          <option value="pc">PC</option>
          <option value="playstation">PlayStation</option>
          <option value="xbox">Xbox</option>
          <option value="nintendo">Nintendo</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="rating_desc">Rating High to Low</option>
          <option value="rating_asc">Rating Low to High</option>
          <option value="date_desc">Newest Release</option>
          <option value="date_asc">Oldest Release</option>
        </select>
      </div>

      {loading ? (
        <p className="message">Loading...</p>
      ) : (
        <>
          <div className="game-grid">
            {games.map((game) => (
              <Link to={`/game/${game.id}`} key={game.id} className="game-card">
                <img src={game.background_image} alt={game.name} />

                <div className="game-info">
                  <h2>{game.name}</h2>
                  <p>Rating: {game.rating ? game.rating.toFixed(2) : "N/A"}</p>
                  <p>Release: {game.released || "Unknown"}</p>
                  <p>
                    Platforms:{" "}
                    {game.platforms
                      ?.slice(0, 3)
                      .map((p) => p.platform.name)
                      .join(", ") || "N/A"}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!previousPage || page === 1}
            >
              Previous
            </button>

            <span>Page {page}</span>

            <button onClick={() => setPage(page + 1)} disabled={!nextPage}>
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}

function GameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);

  useEffect(() => {
    fetchGame();
  }, [id]);

  async function fetchGame() {
    const res = await fetch(
      `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
    );
    const data = await res.json();
    setGame(data);
  }

  if (!game) return <p className="message">Loading...</p>;

  return (
    <div className="details-page">
      <Link to="/" className="back-button">← Back</Link>

      <div className="details-card">
        <img src={game.background_image} alt={game.name} />

        <div className="details-info">
          <h1>{game.name}</h1>
          <p>Rating: {game.rating || "N/A"}</p>
          <p>Release: {game.released || "Unknown"}</p>
          <p>
            Platforms:{" "}
            {game.platforms?.map((p) => p.platform.name).join(", ") || "N/A"}
          </p>

          <p
            dangerouslySetInnerHTML={{
              __html: game.description || "No description available.",
            }}
          ></p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:id" element={<GameDetails />} />
    </Routes>
  );
}

export default App;