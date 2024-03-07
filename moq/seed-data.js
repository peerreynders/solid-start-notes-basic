// file: seed-data.js
import { nanoid } from 'nanoid';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const optionsSanitized = {
	allowedTags: sanitizeHtml.defaults.allowedTags.concat([
		'img',
		'h1',
		'h2',
		'h3',
	]),
	allowedAttributes: Object.assign(
		{},
		sanitizeHtml.defaults.allowedAttributes,
		{
			img: ['alt', 'src'],
		}
	),
};

/** @param { string } rawHtml */
const sanitizedFromRaw = (rawHtml) => sanitizeHtml(rawHtml, optionsSanitized);

const WORD_COUNT = 20;

const optionsPlain = {
	allowedTags: [],
	allowedAttributes: {},
};

/** @param { string } rawHtml */
function excerptFromRaw(rawHtml) {
	// - strip tags from HTML
	// - only use the first 20 words
	const plain = sanitizeHtml(rawHtml, optionsPlain);
	const words = plain.trim().split(/\s+/);
	const begin = words.slice(0, WORD_COUNT).join(' ');
	return words.length > WORD_COUNT ? begin + '…' : begin;
}

/**
 * @param { number } size
 * @param { number } low
 * @param { number } high
 */
function makeEpochMsBetween(size, low, high) {
	const [start, end] = low < high ? [low, high] : [high, low];
	const interval = end - start;
	/** @param {number} value */
	const interpolate = (value) =>
		start + Math.floor((interval * value) / 0xffff_ffff);
	const values = new Uint32Array(size);
	crypto.getRandomValues(values);
	values.sort((a, b) => b - a);
	// Borrow Array's `map` to get regular array instead of TypedArray
	return /** @type { number[] } */ (
		Array.prototype.map.call(values, interpolate)
	);
}

/** @param { number } timestamp */
function startOfYear(timestamp) {
	const date = new Date(timestamp);
	return new Date(date.getFullYear(), 0, 1).getTime();
}

/** typedef { [title: string, body: string] } ContentTuple */
/**
 * @typedef {{
 *	id: string,
 *	title: string,
 *	body: string,
 *	excerpt: string,
 *	html: string,
 *	createdAt: number,
 *	updatedAt: number
 * }} Note
 */

/** @param { ContentTuple[] } content */
function makeCollectContent(content) {
	/**
	 * @param { Note[] } collect
	 * @param { number } createdAt
	 * @param { number } index
	 */
	return function (collected, createdAt, index) {
		const [title, body] = content[index];
		const rawHtml = /** @type { string } */ (
			marked.parse(body, { async: false })
		);
		collected.push({
			id: nanoid(),
			title,
			body,
			excerpt: excerptFromRaw(rawHtml),
			html: sanitizedFromRaw(rawHtml),
			createdAt,
			updatedAt: createdAt,
		});
		return collected;
	};
}

/** @type {ContentTuple[]} */
const content = [
	['Meeting Notes', 'This is an example note. It contains **Markdown**!'],
	[
		'Make a thing',
		`It's very easy to make some words **bold** and other words *italic* with
Markdown. You can even [link to SolidStart's website!](https://start.solidjs.com/).`,
	],
	[
		'A note with a very long title because sometimes you need more words',
		`You can write all kinds of [amazing](https://en.wikipedia.org/wiki/The_Amazing) notes in this app! These notes live on the server in the \`.data/notes\` file.
![This app is powered by SolidStart](https://assets.solidjs.com/banner?project=Start&amp;type=core)`,
	],
	['I wrote this note today', 'It was an excellent note.'],
];

const now = Date.now();
const created = makeEpochMsBetween(content.length, startOfYear(now), now);
const json = JSON.stringify(created.reduce(makeCollectContent(content), []));

console.log(json);
