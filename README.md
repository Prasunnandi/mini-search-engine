# 🔍 Mini Search Engine: Full-Stack Crawler & IR Engine

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4%2B-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack, custom Information Retrieval (IR) platform built completely from scratch without Elasticsearch. Features an asynchronous web crawler, natural language stemmer, custom MongoDB inverted index, and BM25 / TF-IDF ranking algorithms.**

[🚀 Live Demo](#) · [📖 Architecture](#-architecture) · [🐛 Report Bug](https://github.com/Prasunnandi/mini-search-engine/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🕷️ **Polite Web Crawler** | Asynchronous crawler respecting `robots.txt`, domain politeness delay, and content SHA-256 deduplication |
| 📝 **NLP Text Processing** | Full tokenization, lowercasing, punctuation stripping, stop-word elimination, and Porter Stemming (via `natural`) |
| 🗄️ **Custom Inverted Index** | Custom-engineered index mapping terms to document frequencies, term frequencies, and token positions in MongoDB |
| ⚖️ **BM25 & TF-IDF Ranking** | Mathematical relevance ranking implementing Okapi BM25 with customizable document length normalization ($b$) and term saturation ($k_1$) |
| 💡 **Search Intelligence** | Levenshtein edit distance spell-checking, instant query autocomplete, search history, and keyword snippet highlighting |
| 📊 **Admin Control Center** | Visual administrative dashboard for initiating crawls, inspecting index metrics, and monitoring query latency |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React + Vite Web Interface                  │
│       Search Bar · Live Suggestions · Highlighted Snippets  │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST APIs
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Express.js Search Engine Backend             │
│                                                             │
│   ┌────────────────────────┐      ┌─────────────────────┐   │
│   │   Crawler Service      │      │   Query Processor   │   │
│   │   • Axios + Cheerio    │      │   • Spell Correction│   │
│   │   • robots.txt check   │      │   • Token Normalizer│   │
│   │   • SHA-256 Hash check │      │   • Autocomplete    │   │
│   └───────────┬────────────┘      └──────────┬──────────┘   │
│               │                              │              │
│               ▼                              ▼              │
│   ┌────────────────────────┐      ┌─────────────────────┐   │
│   │ NLP & Stemming Pipeline│      │ Ranking Engine      │   │
│   │ Porter Stemmer natural │      │ • Okapi BM25        │   │
│   │ Stop-Word Filter       │      │ • TF-IDF + PageRank │   │
│   └───────────┬────────────┘      └──────────┬──────────┘   │
└───────────────┼──────────────────────────────┼──────────────┘
                │                              │
                ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Database Store                    │
│   • documents: raw HTML, title, URL, clean text, wordCount  │
│   • indices: term -> [docId, tf, positions] (Inverted Index)│
│   • analytics: query frequency, latency, click-through rate │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+) & npm
- MongoDB running locally on default port `27017`

### 1. Backend Setup

```bash
# 1. Clone repository
git clone https://github.com/Prasunnandi/mini-search-engine.git
cd mini-search-engine/backend

# 2. Install dependencies
npm install

# 3. Start the Express search server
node index.js
```
The backend starts on **http://localhost:5000**.

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd ../frontend

# Install dependencies and launch Vite dev server
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

### 3. Crawl & Search
1. Open the Admin Panel at **http://localhost:5173/admin**.
2. Enter a seed URL (e.g., `https://en.wikipedia.org/wiki/Information_retrieval`) and trigger **Crawl**.
3. Once indexed, navigate to the search bar on Home to search and browse ranked results!

---

## 📦 Project Structure

```
mini-search-engine/
│
├── backend/
│   ├── models/
│   │   ├── Document.js        # Mongoose schema for crawled web documents
│   │   ├── Index.js           # Inverted index schema (term, docId, tf, positions)
│   │   └── Analytics.js       # Query latency and search frequency telemetry
│   ├── services/              # Crawler, BM25 ranker, NLP tokenization services
│   ├── index.js               # Main Express application & API routing
│   └── package.json           # Backend dependencies (express, mongoose, cheerio, natural)
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # Search Home, Results, and Admin Dashboard pages
│   │   ├── App.jsx            # Application routing & layout
│   │   └── main.jsx
│   ├── package.json           # Frontend dependencies (React, Vite, Lucide, Tailwind)
│   └── vite.config.js
│
├── INTERVIEW_PREP.md          # Comprehensive IR algorithms, BM25 math & systems Q&A
└── README.md                  # Project documentation
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB & Mongoose ODM |
| **Web Crawling** | Cheerio, Axios, robots-parser |
| **Natural Language Processing** | `natural` (Porter Stemmer, Levenshtein Distance) |
| **Ranking Algorithm** | Okapi BM25 & TF-IDF with length normalization |

---

## 📐 Scoring & Ranking Deep-Dive

### Okapi BM25 Formula
The engine calculates relevance scores between query terms $q \in Q$ and document $D$:

$$\text{Score}(D, Q) = \sum_{i=1}^{N} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

- $f(q_i, D)$: Term frequency of term $q_i$ in document $D$
- $|D|$ and $\text{avgdl}$: Document length and average document length across the collection
- $k_1 = 1.2$: Term frequency saturation parameter
- $b = 0.75$: Document length penalization parameter

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/Prasunnandi/mini-search-engine/issues).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/Prasunnandi">Prasun Nandi</a>
</div>
