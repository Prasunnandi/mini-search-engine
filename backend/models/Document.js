import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  contentHash: { type: String, required: true, unique: true },
  pageRank: { type: Number, default: 1.0 },
  inboundLinks: { type: Number, default: 0 },
  length: { type: Number, default: 0 } // number of tokens
}, { timestamps: true });

export const Document = mongoose.model('Document', documentSchema);
