// @ts-check
// file: src/params.js

const MAIN_TITLE = 'SolidStart Notes';

/** @param { string= } title */
const makeTitle = (title) => (title ? `${title} - ${MAIN_TITLE}` : MAIN_TITLE);

/**
 * @param { string } pathname
 * @returns { never }
 */
function invalidPath(pathname) {
	throw new Error(`Invalid path "${pathname}"`);
}

/** @param { string } pathname */
function pathToParams(pathname) {
	const parts = pathname.split('/');
	// `/`
	if (parts.length === 2 && parts[1].length === 0)
		return { noteId: undefined, isEditing: false, title: makeTitle() };

	if (parts.length > 2 && parts[1] === 'note') {
		// `/note/new`
		if (parts.length === 3 && parts[2] === 'new')
			return {
				noteId: undefined,
				isEditing: true,
				title: makeTitle('New Note'),
			};

		if (parts.length < 5 && parts[2].length > 0) {
			// `/note/:noteId`
			if (parts.length === 3)
				return {
					noteId: parts[2],
					isEditing: false,
					title: makeTitle(parts[2]),
				};

			// `/note/:noteId/edit`
			if (parts[3] === 'edit')
				return {
					noteId: parts[2],
					isEditing: true,
					title: makeTitle(`Edit ${parts[2]}`),
				};

			invalidPath(pathname);
		}

		invalidPath(pathname);
	}

	invalidPath(pathname);
}

/** @param { URL } url */
function urlToParams(url) {
	const { isEditing, noteId, title } = pathToParams(url.pathname);
	const searchParams = url.searchParams;
	const searchText = searchParams.get('search') ?? undefined;

	const nextNoteId = searchParams.get('moqnextid') ?? undefined;

	return {
		flushNote: searchParams.has('moqflush'),
		isEditing,
		nextId: nextNoteId && nextNoteId.length > 0 ? nextNoteId : undefined,
		noteId,
		search:
			typeof searchText === 'string' && searchText.length > 0
				? searchText
				: undefined,
		title,
	};
}

export { urlToParams };
