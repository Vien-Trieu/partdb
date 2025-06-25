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
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', part_number: '', location: '' });

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState('');

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this part?')) return;
    try {
      await fetch(`http://localhost:3001/parts/${id}`, { method: 'DELETE' });
      setResults((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting part:', error);
      alert('Failed to delete part.');
    }
  };

  const handleEdit = (part) => {
    setEditingId(part.id);
    setEditValues({
      name: part.name,
      part_number: part.part_number,
      location: part.location,
    });
  };

  const handleEditChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    const { name, part_number, location } = editValues;
    if (!name.trim() || !part_number.trim() || !location.trim()) {
      alert('Please fill in all fields before saving.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/parts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      const updated = await response.json();
      setResults((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating part:', error);
      alert('Failed to update part.');
    }
  };

  useEffect(() => {
    if (query) handleSearch();
  }, [page]);

  return (
    <>
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">🔎 Part Lookup</h1>

            {results.length > 0 && (
              <button
                onClick={() => window.location.href = '/'}
                className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                ← Back
              </button>
            )}

            {/* Manage Parts Login */}
            {!isAuthorized && (
              <>
                {!showPinPrompt && (
                  <button
                    onClick={() => setShowPinPrompt(true)}
                    className="mb-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Manage Parts
                  </button>
                )}

                {showPinPrompt && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (pin === '1234') {
                        setIsAuthorized(true);
                        setPin('');
                        setShowPinPrompt(false);
                      } else {
                        alert('Incorrect PIN');
                        setPin('');
                      }
                    }}
                    className="mb-6"
                  >
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="input mb-2"
                      placeholder="Enter 4-digit PIN"
                      maxLength={4}
                    />
                    <button type="submit" className="btn-blue mr-2">Submit</button>
                    <button
                      type="button"
                      onClick={() => {
                        setPin('');
                        setShowPinPrompt(false);
                      }}
                      className="btn-gray"
                    >
                      ← Back
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Add New Part Form */}
            {isAuthorized && (
              <>
                <button
                  onClick={() => setIsAuthorized(false)}
                  className="mb-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  ← Back
                </button>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const name = e.target.name.value.trim();
                    const part_number = e.target.part_number.value.trim();
                    const location = e.target.location.value.trim();

                    if (!name || !part_number || !location) {
                      alert('Please fill in all fields.');
                      return;
                    }

                    try {
                      const response = await fetch('http://localhost:3001/parts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, part_number, location }),
                      });

                      const newPart = await response.json();
                      setResults((prev) => [newPart, ...prev]);
                      e.target.reset();
                    } catch (error) {
                      console.error('Error adding part:', error);
                      alert('Failed to add part.');
                    }
                  }}
                  className="mb-8 space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-800">➕ Add New Part</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input name="name" placeholder="Name" className="input" />
                    <input name="part_number" placeholder="Part Number" className="input" />
                    <input name="location" placeholder="Location" className="input" />
                  </div>
                  <button type="submit" className="btn-green">Add Part</button>
                </form>
              </>
            )}

            {/* Search Section */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col md:flex-row gap-4 mb-6"
            >
              <input
                className="input w-full"
                placeholder={`Search by ${type}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="number">Number</option>
              </select>
              <button type="submit" className="btn-blue">Search</button>
            </form>

            {/* Results */}
            {results.length > 0 && (
              <ul className="space-y-3">
                {results.map((part) => (
                  <li
                    key={part.id}
                    className="border border-gray-200 p-4 rounded-xl bg-blue-50 shadow-sm hover:shadow-md transition"
                  >
                    {editingId === part.id ? (
                      <>
                        <input
                          name="name"
                          value={editValues.name}
                          onChange={handleEditChange}
                          className="input mb-1"
                        />
                        <input
                          name="part_number"
                          value={editValues.part_number}
                          onChange={handleEditChange}
                          className="input mb-1"
                        />
                        <input
                          name="location"
                          value={editValues.location}
                          onChange={handleEditChange}
                          className="input mb-1"
                        />
                        {isAuthorized && (
                          <div className="flex gap-2">
                            <button onClick={() => handleEditSave(part.id)} className="btn-green">
                              Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="btn-gray">
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-blue-800">{part.name}</p>
                        <p className="text-sm text-gray-700">Part #: {part.part_number}</p>
                        <p className="text-sm text-gray-600 italic">Location: {part.location}</p>
                        {isAuthorized && (
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => handleEdit(part)} className="btn-yellow">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(part.id)} className="btn-red">
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
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
                  className="btn-nav"
                >
                  Previous
                </button>
                <span className="text-gray-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="btn-nav"
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