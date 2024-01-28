// file: src/lib/md-to-html.ts
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Vite pulls in node APIs due to sanitizeHtml's optional postCSS support
// Client side use DOMPurify instead
function mdToHtml(mdText: string) {
	return DOMPurify.sanitize(marked.parse(mdText, { async: false }) as string);
}

export { mdToHtml };
