import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    axios.get('http://localhost:5000/api/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  };

  const handleCrawl = async (e) => {
    e.preventDefault();
    if (!crawlUrl) return;
    setCrawling(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/crawl', { url: crawlUrl });
      setMessage(res.data.message);
      setTimeout(fetchStats, 5000); // refresh stats after a bit
    } catch (err) {
      setMessage('Error starting crawl.');
    } finally {
      setCrawling(false);
    }
  };

  if (!stats) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <Link to="/" className="text-blue-600 hover:underline">Back to Search</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Documents</h2>
            <p className="text-3xl font-bold text-gray-800">{stats.crawlerStats.docCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-gray-500 text-sm font-semibold mb-2">Indexed Terms</h2>
            <p className="text-3xl font-bold text-gray-800">{stats.indexStats.indexCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Searches</h2>
            <p className="text-3xl font-bold text-gray-800">{stats.searchAnalytics.totalSearches}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">Start New Crawl</h2>
          <form onSubmit={handleCrawl} className="flex gap-4">
            <input 
              type="url" 
              placeholder="https://example.com" 
              value={crawlUrl}
              onChange={(e) => setCrawlUrl(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-4 py-2"
              required
            />
            <button 
              type="submit" 
              disabled={crawling}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {crawling ? 'Starting...' : 'Crawl'}
            </button>
          </form>
          {message && <p className="mt-4 text-green-600">{message}</p>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 text-gray-600">Query</th>
                <th className="py-2 text-gray-600">Results</th>
                <th className="py-2 text-gray-600">Time (ms)</th>
                <th className="py-2 text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.searchAnalytics.recentSearches.map(s => (
                <tr key={s._id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 text-gray-800">{s.query}</td>
                  <td className="py-3 text-gray-800">{s.resultsCount}</td>
                  <td className="py-3 text-gray-800">{s.responseTime}</td>
                  <td className="py-3 text-gray-500 text-sm">{new Date(s.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {stats.searchAnalytics.recentSearches.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">No searches yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
