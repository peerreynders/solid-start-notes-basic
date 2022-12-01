const homeHref = '/';

const noteNewHref = '/new';

const noteHref = (id: string) => `/notes/${ id }`;

const noteEditHref = (id: string) => `/notes/${ id }/edit`;

const noteEditHrefMaybe = (id: string | undefined) => {
  if (!id) return '';

  return noteEditHref(id);
}

function notesSearchHref(searchText: string = '') {
  // TODO: fix SSR origin
  const origin = globalThis['location'] ? location.origin : 'http://localhost:3000';
  const path = `${origin}/api/notes`;
  return searchText.length < 1 ? path : `${path}?search=${encodeURIComponent(searchText)}`
}

function extractNoteId(href: string) {
  const BEFORE = '/notes/'
  let start = href.indexOf(BEFORE);
  if (start < 0) return '';
  start += BEFORE.length;
  const end = href.indexOf('/', start);
  return end < 0 ? href.substring(start) : href.substring(start, end);
}

export {
  homeHref,
  noteNewHref,
  noteHref,
  noteEditHref,
  noteEditHrefMaybe,
  notesSearchHref,
  extractNoteId,
};
