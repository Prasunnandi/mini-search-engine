import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { crawl } from './services/crawler.js';
import { rankDocuments } from './services/ranker.js';
import { Analytics, SearchHistory } from './models/Analytics.js';
import { Document } from './models/Document.js';
import { Index } from './models/Index.js';
import natural from 'natural';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/mini-search', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// API Routes
app.post('/api/crawl', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  
  // Background processing
  crawl(url).then(result => console.log(result)).catch(err => console.error(err));
  res.json({ message: 'Crawling started for ' + url });
});

app.get('/api/search', async (req, res) => {
  const startTime = Date.now();
  const query = req.query.q;
  
  if (!query) return res.json({ results: [], time: 0 });

  try {
    const results = await rankDocuments(query);
    const timeTaken = Date.now() - startTime;

    // Save analytics
    await Analytics.create({
      query,
      resultsCount: results.length,
      responseTime: timeTaken
    });
    
    // Save history
    await SearchHistory.create({ query });

    res.json({
      results,
      time: timeTaken,
      count: results.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Autocomplete and Suggestions
app.get('/api/autocomplete', async (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 2) return res.json({ suggestions: [] });

  try {
    const history = await SearchHistory.distinct('query', {
      query: { $regex: '^' + query, $options: 'i' }
    });
    res.json({ suggestions: history.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Spellcheck using Edit Distance
const spellcheckDictionary = new natural.Spellcheck([]); // Init empty
// We can build dictionary from our Index terms for better spell check
const initSpellcheck = async () => {
    const indices = await Index.find({}, {term:1});
    const words = indices.map(i => i.term);
    spellcheckDictionary.wordList = new Map(words.map(w => [w, true]));
}
initSpellcheck();

app.get('/api/spellcheck', (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ correction: null });
  
  const corrections = query.split(' ').map(word => {
    if (!spellcheckDictionary.isCorrect(word.toLowerCase())) {
      const suggestions = spellcheckDictionary.getCorrections(word.toLowerCase(), 1);
      return suggestions.length > 0 ? suggestions[0] : word;
    }
    return word;
  });

  const correctedQuery = corrections.join(' ');
  res.json({ correction: correctedQuery !== query ? correctedQuery : null });
});

// Admin Stats
app.get('/api/stats', async (req, res) => {
  const docCount = await Document.countDocuments();
  const indexCount = await Index.countDocuments();
  const searches = await Analytics.countDocuments();
  const recentSearches = await Analytics.find().sort({ timestamp: -1 }).limit(10);
  
  res.json({
    crawlerStats: { docCount },
    indexStats: { indexCount },
    searchAnalytics: { totalSearches: searches, recentSearches }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
