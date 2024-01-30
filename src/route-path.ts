// file: src/route-path.ts
import { type Location } from '@solidjs/router';

export type SearchParams = {
	search: string;
};

function toBriefSearch(location: Location<unknown>) {
	const params = new URLSearchParams(location.search);
	return params.get('search') ?? undefined;
}

function extractNoteId(href: string) {
	const BEFORE = '/notes/';
	let start = href.indexOf(BEFORE);
	if (start < 0) return '';
	start += BEFORE.length;
	const end = href.indexOf('/', start);
	return end < 0 ? href.slice(start) : href.slice(start, end);
}

const homePathname = '/';
const noteNewPathname = '/new';
const notePathname = (noteId: string) => `/notes/${noteId}`;
const noteEditPathname = (noteId: string) => `/notes/${noteId}/edit`;

const toRootpath = (current: Location<unknown>) =>
	current.search ? current.pathname + current.search : current.pathname;

// https://github.com/whatwg/url/issues/531#issuecomment-660806926
// add a fake base URL that enables the parse
const searchFromRootpath = (rootpath: string) =>
	new URL(rootpath, 'thismessage:/').search ?? '';

const searchParamFromSearch = (search: string) =>
	search.length > 0 ? new URLSearchParams(search).get('search') ?? '' : '';

const rootpathToHome = (search = '') => homePathname + search;

const rootpathWithNote = (noteId: string, search = '') =>
	notePathname(noteId) + search;

function hrefToNoteEdit(current: Location<unknown>) {
	const noteId = extractNoteId(location.pathname);
	if (noteId.length < 1)
		throw new Error('Pathname was expected to contain a note ID');

	return noteEditPathname(noteId) + (current.search ?? '');
}

const hrefToHome = (current: Location<unknown>) =>
	homePathname + (current.search ?? '');

const hrefToNoteNew = (current: Location<unknown>) =>
	noteNewPathname + (current.search ?? '');

const hrefWithNote = (current: Location<unknown>, noteId: string) =>
	notePathname(noteId) + (current.search ?? '');

const MAIN_TITLE = 'SolidStart Notes';

const makeTitle = (title?: string) =>
	title ? `${title} - ${MAIN_TITLE}` : MAIN_TITLE;

export {
	hrefToHome,
	hrefToNoteEdit,
	hrefToNoteNew,
	hrefWithNote,
	makeTitle,
	rootpathToHome,
	rootpathWithNote,
	searchFromRootpath,
	searchParamFromSearch,
	toBriefSearch,
	toRootpath,
};
