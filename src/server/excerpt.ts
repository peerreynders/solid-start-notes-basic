import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const WORD_COUNT = 20;

function excerpt(body: string){
  // - convert markdown to HTML
  // - strip tags from HTML
  // - only use the first 20 words
  const html = marked.parse(body);
  const plain = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {} 
  });
  const words = plain.trim().split(/\s+/);
  const begin = words.slice(0, WORD_COUNT).join(' ');
  return words.length > WORD_COUNT ? begin + '…' : begin;
}

export {
  excerpt
};
