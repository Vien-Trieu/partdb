/*
Author: Vien Trieu (Date: 6-27-2025)
This file is the main file for the entire app. It holds everything that makes the app
work correctly and smoothly.
DISCLAIMER: THIS FILE IS CONSTANTLY CHANGING PLEASE BE ADVISED!!!
*/

import React, { useState, useEffect, useRef } from 'react';
import SplashScreen from './components/SplashScreen';
import ABB from './assets/ABB.png';
import './index.css';
import './animations.css';
import './App.css';

const API_BASE =
  (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) ||
  'http://127.0.0.1:3001';

/** Robust fetch with timeout, retry, and no-store cache (handles 204/empty bodies) */
/** Faster default: 3s timeout, no retry */
async function fetchJSON(path, options = {}, { retries = 0, timeoutMs = 3000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      cache: 'no-store',
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 250));
      return fetchJSON(path, options, { retries: retries - 1, timeoutMs });
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}


function App() {
  /* === UI / splash control === */
  const [showSplash, setShowSplash] = useState(true);

  /* === Search state === */
  const [query, setQuery] = useState('');
  const [type, setType] = useState('name'); // name | number
  const [results, setResults] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);

  /* === Editing state === */
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', part_number: '', location: '' });

  /* === Authorization for managing parts === */
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState('');

  /* === Pagination === */
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  /* === Feedback / UX state === */
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(() => {});
  const [notification, setNotification] = useState('');
  const [lastError, setLastError] = useState('');

  /* === Activity log === */
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

  /* === View mode (main or logs) === */
  const [viewMode, setViewMode] = useState('main');

  // Remember last successful search params for auto-refresh on visibility/focus
  const lastSearchRef = useRef({ query: '', type: 'name', page: 1 });

  const skipNextSearchRef = useRef(false);


  /* === 🔥 NEW: Suggestions state (for part number type-ahead) === */
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const suggestAbortRef = useRef(null);

  /** Execute a search based on current query/type/page */
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setLastError('');
      return;
    }
    setIsLoading(true);
    setLastError('');
    try {
      const qs = new URLSearchParams({
        [type]: query,
        page: String(page),
        limit: String(limit),
      }).toString();

      const data = await fetchJSON(`/parts?${qs}`);
      if (data) {
        setResults(Array.isArray(data.results) ? data.results : []);
        setTotalPages(Number.isFinite(data.totalPages) ? data.totalPages : 1);
      } else {
        setResults([]);
        setTotalPages(1);
      }
      addLog(`Searched parts by "${type}" with query "${query}" (page ${page})`);
      // Save last successful search
      lastSearchRef.current = { query, type, page };
      try {
        localStorage.setItem('lastSearch', JSON.stringify(lastSearchRef.current));
      } catch {}
    } catch (error) {
      console.error('Search failed:', error);
      setLastError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /** 🔥 NEW: Fetch suggestions for part numbers (prefix match) */
  const fetchSuggestions = async (prefix) => {
    // Cancel any in-flight suggestions request
    if (suggestAbortRef.current) {
      suggestAbortRef.current.abort();
    }
    const controller = new AbortController();
    suggestAbortRef.current = controller;

    try {
      // Backend route added below in the Express snippet
      const qs = new URLSearchParams({ numberPrefix: prefix, limit: '8' }).toString();
      const data = await fetchJSON(`/parts/suggest?${qs}`, { signal: controller.signal });
      setSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(true);
      setHighlightIndex(-1);
    } catch (e) {
      // Ignore abort errors
    } finally {
      suggestAbortRef.current = null;
    }
  };

  /** Re-run search when query/type changes (reset to page 1 or search if already 1) */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 🔥 NEW: when searching by number, we also fetch suggestions (debounced)
    if (type === 'number') {
      const prefix = query.trim();
      const id = setTimeout(() => {
        // Only suggest for at least 1 char; change to >=2 if you prefer
        if (prefix.length >= 1) fetchSuggestions(prefix);
        else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 200); // debounce 200ms

      return () => clearTimeout(id);
    } else {
      // Hide suggestions when not in "number" mode
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type]);

  /** Re-run search when page changes */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (skipNextSearchRef.current) { // ✅ skip first auto-run
        skipNextSearchRef.current = false;
        return;
      }
    if (page !== 1) setPage(1);
      else handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  /** Auto-refresh last search after long idle / tab focus */
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        const { query: q } = lastSearchRef.current;
        if (q && q.trim()) {
          try {
            await handleSearch();
          } catch {}
        }
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  /** Restore last search from localStorage on mount (optional persistence) */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lastSearch'));
      if (saved && saved.query && saved.query.trim()) {
        setQuery(saved.query);
        setType(saved.type || 'name');
        lastSearchRef.current = { query: saved.query, type: saved.type || 'name', page: 1 };
        skipNextSearchRef.current = true; // ✅ don't fire a search immediately
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Delete part and refresh results */
  const performDelete = async (id) => {
    try {
      await fetchJSON(`/parts/${id}`, { method: 'DELETE' }); // 204-friendly
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

  /** Open confirmation dialog */
  const handleDelete = (id) => {
    setConfirmMessage('Are you sure you want to delete this part?');
    setConfirmCallback(() => () => performDelete(id));
    setConfirmOpen(true);
  };

  /** Start editing */
  const handleEdit = (part) => {
    setEditingId(part.id);
    setEditValues({ name: part.name, part_number: part.part_number, location: part.location });
  };

  /** Edit inputs change */
  const handleEditChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  /** Save edited part */
  const handleEditSave = async (id) => {
    const { name, part_number, location } = editValues;
    if (!name.trim() || !part_number.trim() || !location.trim()) {
      alert('Please fill in all fields before saving.');
      return;
    }
    try {
      const updated = await fetchJSON(`/parts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editValues),
      });
      if (updated) {
        setResults(prev => prev.map(p => (p.id === id ? updated : p)));
      }
      addLog(`Edited part #${id}`);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating part:', error);
      alert('Failed to update part.');
    }
  };

  /** Append an entry to the activity log and persist */
  const addLog = (action) => {
    const timestamp = new Date().toISOString().slice(0,16).replace('T',' ');
    const entry = { id: Date.now(), action, timestamp };
    setLogs(prev => {
      const updated = [...prev, entry];
      try {
        localStorage.setItem('activityLogs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  /** Submit logs PIN */
  const submitLogPin = (e) => {
    e.preventDefault();
    if (!/^\d+$/.test(logPin)) {
      alert('PIN must be numeric');
      setLogPin('');
      return;
    }
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

  /** 🔥 NEW: when user picks a suggestion */
  const pickSuggestion = (s) => {
    setQuery(s.part_number);
    setShowSuggestions(false);
    setSuggestions([]);
    // Start at page 1 and run search immediately
    if (page !== 1) setPage(1);
    else handleSearch();
  };

  /** 🔥 NEW: keyboard handling on input */
  const onQueryKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault();
        pickSuggestion(suggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  const inputWrapperRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!inputWrapperRef.current) return;
      if (!inputWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <>
      {/* Splash screen overlay */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        {/* Logo */}
        <div className='logo-container'>
          <img src={ABB} alt="ABB Logo" className='logo' />
        </div>

        {/* === Activity Logs View === */}
        {viewMode === 'logs' && logsAuthorized && (
          <div className="min-h-screen bg-gray-100 flex items-start justify-center p-6">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
              <button
                onClick={() => { setViewMode('main'); setLogsAuthorized(false); }}
                className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-lg"
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

        {/* === Main Lookup Page === */}
        {viewMode === 'main' && (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full">
              <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                🔎 Part Lookup
              </h1>

              {/* Notification banner */}
              {notification && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  {notification}
                </div>
              )}

              {/* Error banner with retry */}
              {lastError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
                  <span>{lastError}</span>
                  <button onClick={handleSearch} className="ml-4 btn-blue text-lg px-4 py-2">
                    Retry
                  </button>
                </div>
              )}

              {/* === Detail View === */}
              {selectedPart ? (
                <>
                  <button
                    onClick={() => setSelectedPart(null)}
                    className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-5 py-3 rounded text-lg"
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
                  {/* Reset to root / clear search */}
                  {results.length > 0 && (
                    <button
                      onClick={() => {
                        setResults([]);
                        setQuery('');
                        setSelectedPart(null);
                        setPage(1);
                      }}
                      className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-5 py-3 rounded text-lg"
                    >
                      ← Home
                    </button>
                  )}

                  {/* === Authorization / PIN controls === */}
                  {!isAuthorized && (
                    <>
                      <button
                        onClick={() => setShowPinPrompt(prev => !prev)}
                        className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded text-lg"
                        title="Enter PIN to manage parts"
                      >
                        Manage Parts
                      </button>
                      {showPinPrompt && !isAuthorized && (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            if (!/^\d+$/.test(pin)) {
                              alert('PIN must be numeric');
                              setPin('');
                              return;
                            }
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
                            onChange={e => setPin(e.target.value)}
                            className="input mb-2 text-lg py-3"
                            placeholder="Enter 4-digit PIN"
                            maxLength={4}
                          />
                          <button type="submit" className="btn-blue text-lg px-6 py-3">
                            Submit
                          </button>
                        </form>
                      )}

                      {/* Activity logs access */}
                      <button
                        onClick={() => setLogPinPrompt(prev => !prev)}
                        disabled={logsAuthorized}
                        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded text-lg disabled:opacity-50"
                      >
                        View Activity Logs
                      </button>
                      {logPinPrompt && !logsAuthorized && (
                        <form onSubmit={submitLogPin} className="mb-6">
                          <input
                            type="password"
                            value={logPin}
                            onChange={e => setLogPin(e.target.value)}
                            className="input mb-2 text-lg py-3"
                            placeholder="Enter 4-digit PIN"
                            maxLength={4}
                          />
                          <button type="submit" className="btn-blue text-lg px-6 py-3">
                            Submit
                          </button>
                        </form>
                      )}
                    </>
                  )}

                  {/* === Add New Part (requires authorization) === */}
                  {isAuthorized && (
                    <>
                      <button
                        onClick={() => { setIsAuthorized(false); setEditingId(null); }}
                        className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-3 rounded text-lg"
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
                            const newPart = await fetchJSON('/parts', {
                              method: 'POST',
                              body: JSON.stringify({ name, part_number, location }),
                            });
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
                          <input name="name" placeholder="Name" className="input text-lg py-3" />
                          <input name="part_number" placeholder="Part Number" className="input text-lg py-3" />
                          <input name="location" placeholder="Location" className="input text-lg py-3" />
                        </div>
                        <button type="submit" className="btn-green text-lg px-6 py-3">
                          Add Part
                        </button>
                      </form>
                    </>
                  )}

                  {/* === Search Form === */}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (page !== 1) setPage(1);
                      else handleSearch();
                    }}
                    className="flex flex-col md:flex-row gap-4 mb-6"
                  >
                    {/* 🔥 NEW: wrapper for suggestions positioning */}
                    <div className="relative w-full" ref={inputWrapperRef}>
                      <input
                        className="input w-full text-lg py-3"
                        placeholder={`Search by ${type}`}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                        onKeyDown={onQueryKeyDown}
                        onFocus={() => { if (type === 'number' && suggestions.length) setShowSuggestions(true); }}
                      />
                      {/* 🔥 NEW: suggestions dropdown */}
                      {type === 'number' && showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">
                          {suggestions.map((s, idx) => (
                            <li
                              key={s.id}
                              onMouseDown={(e) => { e.preventDefault(); }} // prevent input blur
                              onClick={() => pickSuggestion(s)}
                              className={`px-3 py-2 cursor-pointer ${idx === highlightIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                              <div className="flex justify-between">
                                <span className="font-semibold text-gray-800">{s.part_number}</span>
                                <span className="text-gray-500">{s.location}</span>
                              </div>
                              <div className="text-sm text-gray-600">{s.name}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <select
                      className="input text-lg py-3"
                      value={type}
                      onChange={e => {
                        setType(e.target.value);
                        setShowSuggestions(false);
                        setSuggestions([]);
                      }}
                    >
                      <option value="name">Name</option>
                      <option value="number">Number</option>
                    </select>
                    <button
                      type="submit"
                      onClick={() => { if (page === 1) handleSearch(); }}
                      className="btn-blue text-lg px-6 py-3"
                    >
                      Search
                    </button>
                  </form>

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-center items-center my-4">
                      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-10 w-10"></div>
                    </div>
                  )}

                  {/* === Results List === */}
                  {results.length > 0 && (
                    <>
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        🔍 Search Results
                      </h2>
                      <ul className="space-y-3 animate-fade-in">
                        {results.map(part => (
                          <li
                            key={part.id}
                            className="border border-gray-200 p-4 rounded-xl bg-blue-50 shadow-sm hover:shadow-md transition cursor-pointer"
                            onClick={editingId === part.id ? undefined : () => setSelectedPart(part)}
                          >
                            {editingId === part.id ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-4">
                                  <input
                                    name="name"
                                    value={editValues.name}
                                    onChange={handleEditChange}
                                    className="input text-lg py-3"
                                  />
                                  <input
                                    name="part_number"
                                    value={editValues.part_number}
                                    onChange={handleEditChange}
                                    className="input text-lg py-3"
                                  />
                                  <input
                                    name="location"
                                    value={editValues.location}
                                    onChange={handleEditChange}
                                    className="input text-lg py-3"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditSave(part.id)}
                                    className="btn-green text-lg px-6 py-3"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="btn-gray text-lg px-6 py-3"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-3 gap-4">
                                  <span className="text-gray-800 font-semibold">{part.name}</span>
                                  <span className="text-gray-700">{part.part_number}</span>
                                  <span className="text-gray-700">{part.location}</span>
                                </div>
                                {isAuthorized && (
                                  <div className="mt-2 flex space-x-3">
                                    <button
                                      onClick={e => { e.stopPropagation(); handleEdit(part); }}
                                      className="px-5 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 rounded text-lg"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={e => { e.stopPropagation(); handleDelete(part.id); }}
                                      className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded text-lg"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>

                      {/* Pagination Controls */}
                      <div className="flex justify-between items-center mt-4">
                        <button
                          disabled={page === 1}
                          onClick={() => setPage(prev => Math.max(1, prev - 1))}
                          className={`px-5 py-3 rounded text-lg ${page === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
                        >
                          Previous
                        </button>
                        <span className="text-gray-700">Page {page} of {totalPages}</span>
                        <button
                          disabled={page >= totalPages}
                          onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                          className={`px-5 py-3 rounded text-lg ${page >= totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Splash fallback for overlapping layer */}
      {showSplash && (
        <div className="absolute inset-0 z-50">
          <SplashScreen onFinish={() => setShowSplash(false)} />
        </div>
      )}

      {/* Confirmation Modal (solid black overlay) */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-[92%]">
            <p className="mb-4">{confirmMessage}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { confirmCallback(); setConfirmOpen(false); }}
                className="btn-red text-lg px-6 py-3"
              >
                Yes
              </button>
              <button onClick={() => setConfirmOpen(false)} className="btn-gray text-lg px-6 py-3">
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