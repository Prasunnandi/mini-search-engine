import { Index } from '../models/Index.js';
import { Document } from '../models/Document.js';
import { processText } from './indexer.js';

const k1 = 1.2;
const b = 0.75;

export const rankDocuments = async (query) => {
  const queryTerms = processText(query);
  if (queryTerms.length === 0) return [];

  const N = await Document.countDocuments();
  if (N === 0) return [];

  const stats = await Document.aggregate([
    { $group: { _id: null, avgLength: { $avg: "$length" } } }
  ]);
  const avgdl = stats.length > 0 ? stats[0].avgLength : 1;

  const indices = await Index.find({ term: { $in: queryTerms } }).populate('postings.docId');
  
  const scores = {}; 
  
  indices.forEach(index => {
    const term = index.term;
    const df = index.postings.length;
    
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    
    index.postings.forEach(posting => {
      const doc = posting.docId;
      if (!doc) return;
      const docId = doc._id.toString();
      const tf = posting.tf;
      const dl = doc.length;
      
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + b * (dl / avgdl));
      const bm25Score = idf * (numerator / denominator);
      
      const tfIdfScore = tf * idf;

      if (!scores[docId]) {
        scores[docId] = {
          doc,
          bm25: 0,
          tfidf: 0,
          matchedTerms: []
        };
      }
      
      scores[docId].bm25 += bm25Score;
      scores[docId].tfidf += tfIdfScore;
      if(!scores[docId].matchedTerms.includes(term)) {
         scores[docId].matchedTerms.push(term);
      }
    });
  });

  const results = Object.values(scores).map(s => {
    s.finalScore = (s.bm25 * 0.8) + ((s.doc.pageRank || 1) * 0.2);
    
    const snippet = generateSnippet(s.doc.content, queryTerms);
    
    return {
      id: s.doc._id,
      url: s.doc.url,
      title: s.doc.title,
      snippet,
      score: s.finalScore,
      bm25: s.bm25,
      pageRank: s.doc.pageRank,
      matchedTerms: s.matchedTerms
    };
  });

  return results.sort((a, b) => b.score - a.score);
};

const generateSnippet = (content, queryTerms) => {
  if (!content) return "";
  const lowerContent = content.toLowerCase();
  
  let bestIndex = -1;
  
  for (const term of queryTerms) {
    const idx = lowerContent.indexOf(term.replace(/[^a-z0-9]/gi, '').toLowerCase());
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }
  
  if (bestIndex === -1) {
    return content.substring(0, 160) + "...";
  }
  
  const start = Math.max(0, bestIndex - 60);
  const end = Math.min(content.length, bestIndex + 100);
  let snippet = content.substring(start, end);
  
  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";
  
  return snippet;
};
