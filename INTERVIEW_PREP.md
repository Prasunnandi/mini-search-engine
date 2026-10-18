# Interview Prep: Search Engine Architecture

## 1. Web Crawler
**Q: How do you prevent crawling the same page twice or infinite loops?**
A: We use a `visited` Set in-memory for the current session and track normalized URLs. Additionally, we create a cryptographic hash (SHA-256) of the document's content. If a new URL resolves to the same content hash, we simply increase the `inboundLinks` counter and discard the duplicate HTML to save space and avoid duplicate index entries.

**Q: How do you respect domain policies?**
A: We parse the `robots.txt` file at the domain root using a library (`robots-parser`) and check `isAllowed(url, 'MiniSearchBot')`.

## 2. Inverted Index
**Q: What is an inverted index? Why not just use `LIKE %query%` in SQL?**
A: An inverted index maps terms (words) to the list of documents containing them (postings list). SQL `LIKE` scans every document linearly $O(N)$. An inverted index lookup is $O(1)$ for the term, and then we just process the associated postings list, massively speeding up query times.

## 3. TF-IDF and BM25
**Q: Explain TF-IDF.**
A: Term Frequency - Inverse Document Frequency.
- **TF**: How often the term appears in the document.
- **IDF**: How rare the term is across all documents. Calculated as `log(Total Docs / Docs with Term)`.
Scores are multiplied. Rare words in the corpus get higher weight.

**Q: How is BM25 different/better than TF-IDF?**
A: BM25 improves on TF-IDF by adding term frequency saturation (a term appearing 100 times isn't 100x more relevant than appearing 10 times, it plateaus) and document length normalization (a match in a short document is more relevant than in a massive document). Parameters `k1` and `b` control these factors.

## 4. PageRank
**Q: How does PageRank work?**
A: It treats links as votes. A page with many inbound links from other important pages is considered more authoritative. We simulated a simplified version by boosting the base score of a document based on its `inboundLinks` count during crawling, which gets weighted into the final score alongside BM25.

## 5. Infosys SP/SDE Specific Questions
- **System Design Scalability**: If the crawler grows, how to scale? (Use message queues like RabbitMQ/Kafka for URL frontiers, distributed workers, distributed NoSQL databases).
- **Concurrency**: Node.js is single-threaded, how does it handle many concurrent crawl requests? (Asynchronous I/O via the Event Loop).
- **Spell Correction**: Implemented using Edit Distance (Levenshtein distance), comparing user input against dictionary terms or indexed terms.
