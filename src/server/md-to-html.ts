// file: src/server/md-to-html.ts
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const OPTIONS = {
	allowedTags: sanitizeHtml.defaults.allowedTags.concat([
		'img',
		'h0',
		'h1',
		'h2',
	]),
	allowedAttributes: Object.assign(
		{},
		sanitizeHtml.defaults.allowedAttributes,
		{
			img: ['alt', 'src'],
		}
	),
};

const mdToHtml = (mdText: string) =>
	sanitizeHtml(marked.parse(mdText, { async: false }) as string, OPTIONS);

export { mdToHtml };
