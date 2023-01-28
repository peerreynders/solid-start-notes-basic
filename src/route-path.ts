import { isServer } from 'solid-js/web';
import { useServerContext } from 'solid-start';

let __origin: string | undefined;

function serverOrigin() {
  if (__origin) return __origin;

  if (isServer) {
    const event = useServerContext();
    const kState = Object.getOwnPropertySymbols(event.request).find(
      (s: Symbol) => s.toString() === 'Symbol(state)'
    );
    if (!kState) throw new Error(`Unable to locate "Symbol(state)" on request`);

    // @ts-expect-error
    const url = event.request[kState]?.url as URL | undefined;
    if (!url) throw new Error(`Unable to access URL object on request`);

    __origin = url.origin;
  } else {
    __origin = location.origin;
  }

  return __origin;
}

function notesSearchHref(searchText: string = '') {
  const path = serverOrigin() + '/api/notes';
  return searchText.length < 1
    ? path
    : `${path}?search=${encodeURIComponent(searchText)}`;
}

function extractNoteId(href: string) {
  const BEFORE = '/notes/';
  let start = href.indexOf(BEFORE);
  if (start < 0) return '';
  start += BEFORE.length;
  const end = href.indexOf('/', start);
  return end < 0 ? href.substring(start) : href.substring(start, end);
}

const homeHref = '/';

const noteNewHref = '/new';

const noteHref = (id: string) => `/notes/${id}`;

const noteEditHref = (id: string) => `/notes/${id}/edit`;

const noteEditHrefMaybe = (id: string | undefined) => {
  if (!id) return '';

  return noteEditHref(id);
};

export {
  homeHref,
  noteNewHref,
  noteHref,
  noteEditHref,
  noteEditHrefMaybe,
  notesSearchHref,
  extractNoteId,
};
