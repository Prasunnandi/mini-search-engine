import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';

export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [time, setTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [spellCorrection, setSpellCorrection] = useState(null);
  
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setSearchInput(query);
    
    axios.get(`http://localhost:5000/api/spellcheck?q=${query}`)
      .then(res => setSpellCorrection(res.data.correction))
      .catch(err => console.error(err));

    axios.get(`http://localhost:5000/api/search?q=${query}`)
      .then(res => {
        setResults(res.data.results);
        setTime(res.data.time);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput });
    }
  };

  const renderSnippet = (snippet, matchedTerms) => {
    let html = snippet;
    matchedTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      html = html.replace(regex, '<strong>$1</strong>');
    });
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center p-6 border-b border-gray-200">
        <Link to="/" className="text-2xl font-bold text-blue-600 mr-8">Mini Search</Link>
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
          <div className="flex items-center bg-white rounded-full shadow-sm hover:shadow-md border border-gray-200 px-4 py-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 outline-none"
            />
            <button type="submit">
              <Search className="text-blue-500 ml-2" size={20} />
            </button>
          </div>
        </form>
      </header>
      
      <main className="max-w-3xl ml-6 mt-4 md:ml-32 px-4">
        {spellCorrection && (
          <div className="text-red-600 mb-4 text-lg">
            Did you mean: <Link to={`/search?q=${spellCorrection}`} className="font-bold hover:underline italic">{spellCorrection}</Link>?
          </div>
        )}
      
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            About {results.length} results ({time / 1000} seconds)
          </p>
        )}

        {loading ? (
          <div className="text-gray-500">Loading results...</div>
        ) : (
          <div className="space-y-8 pb-10">
            {results.map((res) => (
              <div key={res.id} className="max-w-xl">
                <a href={res.url} target="_blank" rel="noreferrer" className="text-sm text-gray-700 truncate block">
                  {res.url}
                </a>
                <a href={res.url} target="_blank" rel="noreferrer" className="text-xl text-blue-800 hover:underline">
                  {res.title}
                </a>
                <div className="text-sm text-gray-600 mt-1">
                  {renderSnippet(res.snippet, res.matchedTerms)}
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Score: {res.score.toFixed(4)} (BM25: {res.bm25.toFixed(2)} | PR: {res.pageRank.toFixed(2)})
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <div className="text-gray-600 mt-10">
                No results found for <strong>{query}</strong>.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
