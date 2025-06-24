import { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import './index.css';
import './animations.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('name');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = async () => {
    if (!query) return;

    try {
      const response = await fetch(
        `http://localhost:3001/parts?${type}=${query}&page=${page}&limit=${limit}`
      );
      const data = await response.json();
      setResults(data.results);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [page]);

  return (
    <>
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              🔎 Part Lookup
            </h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Search by ${type}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="number">Number</option>
              </select>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>

            {results.length > 0 && (
              <ul className="space-y-3">
                {results.map((part) => (
                  <li
                    key={part.id}
                    className="border border-gray-200 p-4 rounded-xl bg-blue-50 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-lg font-semibold text-blue-800">{part.name}</p>
                    <p className="text-sm text-gray-700">Part #: {part.part_number}</p>
                    <p className="text-sm text-gray-600 italic">Location: {part.location}</p>
                  </li>
                ))}
              </ul>
            )}

            {results.length === 0 && query && (
              <p className="text-center text-gray-500 mt-4">No results found.</p>
            )}

            {results.length > 0 && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded ${
                    page === 1
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className={`px-4 py-2 rounded ${
                    page >= totalPages
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showSplash && (
        <div className="absolute inset-0 z-50">
          <SplashScreen onFinish={() => setShowSplash(false)} />
        </div>
      )}
    </>
  );
}

export default App;