import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import robotsParser from 'robots-parser';
import { Document } from '../models/Document.js';
import { indexDocument } from './indexer.js';

const MAX_PAGES = 30; // Limit for this demo
let crawledCount = 0;
const visited = new Set();
const queue = [];

const hashContent = (content) => crypto.createHash('sha256').update(content).digest('hex');

const checkRobotsTxt = async (url) => {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
    const res = await axios.get(robotsUrl, { timeout: 2000 });
    const robots = robotsParser(robotsUrl, res.data);
    return robots.isAllowed(url, 'MiniSearchBot');
  } catch (e) {
    return true; // Allow by default
  }
};

export const crawl = async (startUrl) => {
  queue.push(startUrl);
  crawledCount = 0;
  visited.clear();

  while (queue.length > 0 && crawledCount < MAX_PAGES) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    const allowed = await checkRobotsTxt(url);
    if (!allowed) continue;

    try {
      console.log(`Crawling: ${url}`);
      const res = await axios.get(url, { timeout: 5000 });
      const html = res.data;
      const $ = cheerio.load(html);

      const title = $('title').text() || url;
      $('script, style, noscript, nav, footer, header').remove();
      const content = $('body').text().replace(/\s+/g, ' ').trim();
      
      if (!content || content.length < 50) continue;

      const hash = hashContent(content);

      const existing = await Document.findOne({ contentHash: hash });
      if (existing) {
        await Document.findByIdAndUpdate(existing._id, { $inc: { inboundLinks: 1 } });
        continue;
      }

      // Basic PageRank demo simulation - assigning random initial rank, then boosting by inbound links
      const pageRank = 1.0; 
      
      const doc = await Document.create({ url, title, content, contentHash: hash, pageRank });
      crawledCount++;

      await indexDocument(doc._id, title + " " + content);

      $('a').each((i, link) => {
        const href = $(link).attr('href');
        if (href && href.startsWith('http') && !visited.has(href) && queue.length < 100) {
          queue.push(href);
        }
      });

    } catch (err) {
      console.error(`Error crawling ${url}: ${err.message}`);
    }
  }
  
  // Re-calculate basic PageRank demo (just boosting by inbound links count)
  const allDocs = await Document.find({});
  for(let doc of allDocs) {
    doc.pageRank = 1.0 + (doc.inboundLinks * 0.5);
    await doc.save();
  }

  return { message: `Crawled ${crawledCount} pages.`, crawledCount };
};
