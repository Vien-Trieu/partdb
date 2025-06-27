import { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import './index.css';
import './animations.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('name');
  const [results, setResults] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', part_number: '', location: '' });

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(() => {});
  const [notification, setNotification] = useState('');

  // ─── Activity Log State ───────────────────────────────────────────────
  const [logs, setLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('activityLogs')) || [];
    } catch {
      return [];
    }
  });
  const [logPinPrompt, setLogPinPrompt] = useState(false);
  const [logPin, setLogPin] = useState('');
  const [logsAuthorized, setLogsAuthorized] = useState(false);

  // View mode: 'main' or 'logs'
  const [viewMode, setViewMode] = useState('main');

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/parts?${type}=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      const data = await response.json();
      setResults(data.results);
      setTotalPages(data.totalPages);
      addLog(`Searched parts by "${type}" with query "${query}" (page ${page})`);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performDelete = async (id) => {
    try {
      await fetch(`http://localhost:3001/parts/${id}`, { method: 'DELETE' });
      if (query) await handleSearch();
      else setResults(prev => prev.filter(p => p.id !== id));
      setNotification('Part deleted successfully!');
      addLog(`Deleted part #${id}`);
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error deleting part:', error);
      alert('Failed to delete part.');
    }
  };

  const handleDelete = (id) => {
    setConfirmMessage('Are you sure you want to delete this part?');
    setConfirmCallback(() => () => performDelete(id));
    setConfirmOpen(true);
  };

  const handleEdit = (part) => {
    setEditingId(part.id);
    setEditValues({ name: part.name, part_number: part.part_number, location: part.location });
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
      setResults(prev => prev.map(p => (p.id === id ? updated : p)));
      addLog(`Edited part #${id}`);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating part:', error);
      alert('Failed to update part.');
    }
  };

  // helper: append a new log entry (and persist)
  const addLog = (action) => {
    const timestamp = new Date().toISOString().slice(0,16).replace('T',' ');
    const entry = { id: Date.now(), action, timestamp };
    setLogs(prev => {
      const updated = [...prev, entry];
      localStorage.setItem('activityLogs', JSON.stringify(updated));
      return updated;
    });
  };

  // ─── Logs PIN Submission Handler ────────────────────────────────────────
  const submitLogPin = (e) => {
    e.preventDefault();
    if (logPin === '4321') {
      setLogsAuthorized(true);
      setLogPinPrompt(false);
      setLogPin('');
      setViewMode('logs');
    } else {
      alert('Incorrect PIN for logs');
      setLogPin('');
    }
  };

  useEffect(() => {
    if (query) handleSearch();
  }, [page]);

  return (
    <>
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        {/* Logs Page */}
        {viewMode === 'logs' && logsAuthorized && (
          <div className="min-h-screen bg-gray-100 flex items-start justify-center p-6">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
              <button
                onClick={() => {
                  setViewMode('main');
                  setLogsAuthorized(false);
                }}
                className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>
              {logs.length === 0 ? (
                <p>No actions logged yet.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {logs.map(log => (
                    <li key={log.id}>
                      <span className="font-mono">{log.timestamp}</span> — {log.action}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Main Lookup Page */}
        {viewMode === 'main' && (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
              <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                🔎 Part Lookup
              </h1>

              {notification && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  {notification}
                </div>
              )}

              {/* Detail View */}
              {selectedPart ? (
                <>
                  <button
                    onClick={() => setSelectedPart(null)}
                    className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    ← Back to Results
                  </button>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-blue-800">
                      {selectedPart.name}
                    </h2>
                    <p className="text-gray-700">Part Number: {selectedPart.part_number}</p>
                    <p className="text-gray-700">Location: {selectedPart.location}</p>
                  </div>
                </>
              ) : (
                <>
                  {/* Back to root */}
                  {results.length > 0 && (
                    <button
                      onClick={() => (window.location.href = '/')}
                      className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                      ← Back
                    </button>
                  )}

                  {/* Manage Parts & Logs Buttons */}
                  {!isAuthorized && (
                    <>
                      <button
                        onClick={() => setShowPinPrompt(!showPinPrompt)}
                        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        title="Enter PIN to manage parts"
                      >
                        Manage Parts
                      </button>
                      {showPinPrompt && !isAuthorized && (
                        <form
                          onSubmit={e => {
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
                          className="mb-4"
                        >
                          <input
                            type="password"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            className="input mb-2"
                            placeholder="Enter 4-digit PIN"
                            maxLength={4}
                          />
                          <button type="submit" className="btn-blue">
                            Submit
                          </button>
                        </form>
                      )}

                      <button
                        onClick={() => setLogPinPrompt(true)}
                        disabled={logsAuthorized}
                        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        View Activity Logs
                      </button>
                      {logPinPrompt && !logsAuthorized && (
                        <form onSubmit={submitLogPin} className="mb-4">
                          <input
                            type="password"
                            value={logPin}
                            onChange={e => setLogPin(e.target.value)}
                            className="input mb-2"
                            placeholder="Enter 4-digit PIN"
                            maxLength={4}
                          />
                          <button type="submit" className="btn-blue">
                            Submit
                          </button>
                        </form>
                      )}
                    </>
                  )}

                  {/* Add New Part */}
                  {isAuthorized && (
                    <>
                      <button
                        onClick={() => setIsAuthorized(false)}
                        className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
                      >
                        ← Back
                      </button>
                      <form
                        onSubmit={async e => {
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
                            setResults(prev => [newPart, ...prev]);
                            e.target.reset();
                          } catch (error) {
                            console.error('Error adding part:', error);
                            alert('Failed to add part.');
                          }
                        }}
                        className="mb-8 space-y-4"
                      >
                        <h2 className="text-xl font-semibold text-gray-800">
                          ➕ Add New Part
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input name="name" placeholder="Name" className="input" />
                          <input name="part_number" placeholder="Part Number" className="input" />
                          <input name="location" placeholder="Location" className="input" />
                        </div>
                        <button type="submit" className="btn-green">
                          Add Part
                        </button>
                      </form>
                    </>
                  )}

                  {/* Search Form */}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      setPage(1);
                      handleSearch();
                    }}
                    className="flex flex-col md:flex-row gap-4 mb-6"
                  >
                    <input
                      className="input w-full"
                      placeholder={`Search by ${type}`}
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                    />
                    <select
                      className="input"
                      value={type}
                      onChange={e => setType(e.target.value)}
                    >
                      <option value="name">Name</option>
                      <option value="number">Number</option>
                    </select>
                    <button type="submit" className="btn-blue">
                      Search
                    </button>
                  </form>

                  {isLoading && (
                    <div className="flex justify-center items-center my-4">
                      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-10 w-10"></div>
                    </div>
                  )}

                  {/* Results List, Pagination, etc. */}
                  {results.length > 0 && (
                    <ul className="space-y-3 animate-fade-in">
                      {results.map(part => (
                        <li
                          key={part.id}
                          className="border border-gray-200 p-4 rounded-xl bg-blue-50 shadow-sm hover:shadow-md transition cursor-pointer"
                          onClick={() => setSelectedPart(part)}
                        >
                          {/* ...editing vs display logic unchanged... */}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showSplash && (
        <div className="absolute inset-0 z-50">
          <SplashScreen onFinish={() => setShowSplash(false)} />
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4">{confirmMessage}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  confirmCallback();
                  setConfirmOpen(false);
                }}
                className="btn-red"
              >
                Yes
              </button>
              <button onClick={() => setConfirmOpen(false)} className="btn-gray">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;