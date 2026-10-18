import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleInput = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 1) {
      try {
        const res = await axios.get(`http://localhost:5000/api/autocomplete?q=${val}`);
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl px-4 text-center">
        <h1 className="text-5xl font-bold text-blue-600 mb-8">Mini Search</h1>
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-white rounded-full shadow-md hover:shadow-lg focus-within:shadow-lg border border-gray-200 px-4 py-3 transition-shadow">
            <Search className="text-gray-400 mr-3" />
            <input
              type="text"
              value={query}
              onChange={handleInput}
              className="flex-1 outline-none text-lg"
              placeholder="Search the web..."
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-xl shadow-lg text-left overflow-hidden">
              {suggestions.map((s, i) => (
                <li 
                  key={i} 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => { setQuery(s); navigate(`/search?q=${encodeURIComponent(s)}`); }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </form>
        <div className="mt-8 flex justify-center space-x-4">
          <button onClick={handleSearch} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors">
            Search
          </button>
          <button onClick={() => navigate('/admin')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors">
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
