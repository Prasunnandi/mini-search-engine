import natural from 'natural';
import { Index } from '../models/Index.js';
import { Document } from '../models/Document.js';

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
// Extract english stopwords directly since it might not be exported directly
import stopword from 'natural/lib/natural/util/stopwords.js';
const stopwords = stopword.words;

export const processText = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase().replace(/[^\w\s]/gi, ' ');
  const tokens = tokenizer.tokenize(lowerText);
  if (!tokens) return [];
  const filtered = tokens.filter(t => !stopwords.includes(t) && t.length > 1);
  return filtered.map(t => stemmer.stem(t));
};

export const indexDocument = async (docId, text) => {
  const tokens = processText(text);
  const termCounts = {};
  const positions = {};

  tokens.forEach((term, idx) => {
    termCounts[term] = (termCounts[term] || 0) + 1;
    if (!positions[term]) positions[term] = [];
    positions[term].push(idx);
  });

  await Document.findByIdAndUpdate(docId, { length: tokens.length });

  const bulkOps = Object.keys(termCounts).map(term => {
    return {
      updateOne: {
        filter: { term },
        update: {
          $push: {
            postings: {
              docId,
              tf: termCounts[term],
              positions: positions[term]
            }
          }
        },
        upsert: true
      }
    };
  });

  if (bulkOps.length > 0) {
    await Index.bulkWrite(bulkOps);
  }
};
