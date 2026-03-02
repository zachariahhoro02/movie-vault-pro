import React, { useState, useEffect } from 'react';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [anime, setAnime] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [myList, setMyList] = useState(() => {
    // Load saved list from browser storage on startup
    const saved = localStorage.getItem("movieVaultList");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [view, setView] = useState("Home");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  const API_KEY = process.env.REACT_APP_TMDB_KEY;

  // Save to LocalStorage whenever myList changes
  useEffect(() => {
    localStorage.setItem("movieVaultList", JSON.stringify(myList));
  }, [myList]);

  const fetchData = async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`),
        fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16`)
      ]);
      const mData = await mRes.json();
      const aData = await aRes.json();
      setMovies(mData.results || []);
      setAnime(aData.results || []);
    } catch (err) { console.error(err); }
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
      setView("Search");
      setSelectedProfile(null);
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) { console.error(err); }
    }
  };

  const fetchTrailer = async (item) => {
    const type = item.title ? 'movie' : 'tv';
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${item.id}/videos?api_key=${API_KEY}`);
    const data = await res.json();
    const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
    setTrailerKey(trailer ? trailer.key : null);
    setShowVideo(true);
  };

  const toggleMyList = (item) => {
    const isAlreadyAdded = myList.find(m => m.id === item.id);
    if (isAlreadyAdded) {
      setMyList(myList.filter(m => m.id !== item.id));
    } else {
      setMyList([...myList, item]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const MovieCard = ({ item }) => {
    const [hover, setHover] = useState(false);
    return (
      <div onClick={() => setSelectedProfile(item)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ minWidth: '220px', cursor: 'pointer', transition: '0.3s ease', transform: hover ? 'scale(1.05)' : 'scale(1)', zIndex: hover ? 10 : 1 }}>
        <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: hover ? '0 10px 30px rgba(0,0,0,0.7)' : 'none' }}>
          <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} style={{ width: '100%', height: '320px', objectFit: 'cover' }} alt="" />
        </div>
        <h4 style={{ fontSize: '0.9rem', marginTop: '10px', textAlign: 'center' }}>{item.title || item.name}</h4>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#efefef', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: isSidebarOpen ? '260px' : '0px', backgroundColor: '#111', transition: '0.4s', overflow: 'hidden', height: '100vh', borderRight: isSidebarOpen ? '1px solid #222' : 'none', zIndex: 2000 }}>
        <div style={{ padding: '40px 20px', width: '260px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '40px' }}>MovieVault</h1>
          {['Home', 'Movies', 'TV Shows', 'Anime', 'My List'].map(item => (
            <button key={item} onClick={() => { setView(item); setSelectedProfile(null); }} style={{
              display: 'flex', width: '100%', padding: '12px 15px', borderRadius: '12px', border: 'none', cursor: 'pointer', marginBottom: '8px',
              backgroundColor: view === item && !selectedProfile ? '#E50914' : 'transparent', color: 'white', fontWeight: 'bold'
            }}>{item}</button>
          ))}
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 30px', gap: '20px', background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(15px)', zIndex: 1500 }}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: '#E50914', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '8px' }}>☰</button>
          <input placeholder="Search movies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}
            style={{ flex: 1, maxWidth: '400px', padding: '10px 20px', borderRadius: '20px', border: '1px solid #333', backgroundColor: '#000', color: 'white', outline: 'none' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
          {selectedProfile ? (
            <div>
              <button onClick={() => setSelectedProfile(null)} style={{ color: '#E50914', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>← Back</button>
              <div style={{ 
                height: '500px', borderRadius: '30px', position: 'relative', overflow: 'hidden',
                backgroundImage: `linear-gradient(to top, #0a0a0a, transparent), url(https://image.tmdb.org/t/p/original${selectedProfile.backdrop_path})`,
                backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '50px'
              }}>
                <div style={{ maxWidth: '750px' }}>
                  <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>{selectedProfile.title || selectedProfile.name}</h1>
                  <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '30px' }}>{selectedProfile.overview}</p>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => fetchTrailer(selectedProfile)} style={{ padding: '16px 45px', borderRadius: '12px', border: 'none', backgroundColor: '#E50914', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>▶ Play Movie</button>
                    <button onClick={() => toggleMyList(selectedProfile)} style={{ padding: '16px 45px', borderRadius: '12px', border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                      {myList.find(m => m.id === selectedProfile.id) ? '✓ In My List' : '+ Add to List'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {view === "My List" && (
                <div>
                  <h2 style={{ marginBottom: '30px' }}>My Saved List ({myList.length})</h2>
                  {myList.length === 0 ? <p>Your list is empty. Start adding some movies!</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
                      {myList.map(item => <MovieCard key={item.id} item={item} />)}
                    </div>
                  )}
                </div>
              )}
              {view === "Home" && (
                <>
                  {movies[heroIndex] && (
                    <div onClick={() => setSelectedProfile(movies[heroIndex])} style={{ height: '400px', borderRadius: '25px', marginBottom: '50px', backgroundImage: `linear-gradient(to right, #0a0a0a, transparent), url(https://image.tmdb.org/t/p/original${movies[heroIndex].backdrop_path})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '50px', cursor: 'pointer' }}>
                      <h2 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>{movies[heroIndex].title}</h2>
                      <p>Featured Today</p>
                    </div>
                  )}
                  <h3 style={{ marginBottom: '20px' }}>Trending Movies</h3>
                  <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none' }}>
                    {movies.map(movie => <MovieCard key={movie.id} item={movie} />)}
                  </div>
                </>
              )}
              {view === "Search" && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
                  {searchResults.map(item => <MovieCard key={item.id} item={item} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showVideo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ width: '90%', maxWidth: '1000px', position: 'relative' }}>
            <button onClick={() => setShowVideo(false)} style={{ position: 'absolute', top: '-25px', right: '-25px', background: '#E50914', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            <div style={{ paddingBottom: '56.25%', position: 'relative', height: 0 }}>
              <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '20px' }} src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}