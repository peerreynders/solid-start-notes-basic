// file: src/route-path.ts
import { type Location } from '@solidjs/router';

export type SearchParams = {
	search: string;
};

const homePathname = '/';
const noteNewPathname = '/new';
const notePathname = (noteId: string) => `/notes/${noteId}`;
const noteEditPathname = (noteId: string) => `/notes/${noteId}/edit`;

function extractNoteId(href: string) {
	const BEFORE = '/notes/';
	let start = href.indexOf(BEFORE);
	if (start < 0) return '';
	start += BEFORE.length;
	const end = href.indexOf('/', start);
	return end < 0 ? href.slice(start) : href.slice(start, end);
}

function hrefToNoteEdit(current: Location<unknown>) {
	const noteId = extractNoteId(location.pathname);
	if (noteId.length < 1)
		throw new Error('Pathname was expected to contain a note ID');
	const href = noteEditPathname(noteId);
	return current.search ? href + current.search : href;
}

const hrefToHome = (current: Location<unknown>) =>
	current.search ? homePathname + current.search : homePathname;

const hrefToNoteNew = (current: Location<unknown>) =>
	current.search ? noteNewPathname + current.search : noteNewPathname;

const hrefWithNote = (current: Location<unknown>, noteId: string) =>
	current.search ? notePathname(noteId) + current.search : notePathname(noteId);

const MAIN_TITLE = 'SolidStart Notes';

const makeTitle = (title?: string) =>
	title ? `${title} - ${MAIN_TITLE}` : MAIN_TITLE;

export { hrefToHome, hrefToNoteEdit, hrefToNoteNew, hrefWithNote, makeTitle };
