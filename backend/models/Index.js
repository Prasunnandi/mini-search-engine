import mongoose from 'mongoose';

const indexSchema = new mongoose.Schema({
  term: { type: String, required: true, unique: true },
  postings: [{
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    tf: { type: Number, required: true },
    positions: [Number] // optional for phrase search
  }],
  idf: { type: Number, default: 0 } // optional precomputed
});

// Index for faster lookups
indexSchema.index({ term: 1 });

export const Index = mongoose.model('Index', indexSchema);
