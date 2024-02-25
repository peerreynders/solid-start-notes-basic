// file: src/lib/md-to-html.ts
import { isServer } from 'solid-js/web';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

let toHtml: ((mdText: string) => string) | undefined;

function mdToHtml(mdText: string) {
	if (toHtml) return toHtml(mdText);

	// entry-server.tsx attaches mdToHtml based on sanitizeHtml
	// which doesn't require DOM for SSR.
	toHtml = isServer
		? globalThis.ssrSupport.mdToHtml
		: (mdArg: string) =>
				DOMPurify.sanitize(marked.parse(mdArg, { async: false }) as string);
	// Vite pulls in node APIs due to sanitizeHtml's optional postCSS support
	// On client side use DOMPurify instead but don't import HERE to keep `sanitizeHtml`
	// out of the client bundle

	if (!toHtml) throw new Error('Late binding of `mdToHtml` failed');
	return mdToHtml(mdText);
}

export { mdToHtml };
