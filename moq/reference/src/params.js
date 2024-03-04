// @ts-check
// file: src/params.js

/** @param { URL } url */
function urlToParams(url) {
	const searchParams = url.searchParams;
	const nextNoteId = searchParams.get('moqnextid') ?? undefined;
	const locationJson = searchParams.get('location') ?? undefined;
	const location = locationJson ? JSON.parse(locationJson) : {};

	const nextId = nextNoteId && nextNoteId.length > 0 ? nextNoteId : undefined;
	const noteId =
		typeof location.selectedId === 'string' ? location.selectedId : undefined;

	return {
		flushNote: searchParams.has('moqflush'),
		isEditing:
			typeof location.isEditing === 'boolean' ? location.isEditing : false,
		listLoading: searchParams.has('moqlistload'),
		nextId: nextId && nextId !== noteId ? nextId : undefined,
		noteId,
		search:
			typeof location.searchText === 'string' && location.searchText.length > 0
				? location.searchText
				: undefined,
	};
}

export { urlToParams };
