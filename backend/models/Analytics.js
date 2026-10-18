import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  resultsCount: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 } // in ms
});

export const Analytics = mongoose.model('Analytics', analyticsSchema);

const searchHistorySchema = new mongoose.Schema({
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
