// @ts-check
// file: src/components/note-list.js
import { contentById, contentItemPairById } from '../template';
import { makeDefinition as defineSidebarNote } from './sidebar-note';

/** @typedef { import('../internal.d.ts').NotePersist } NotePersist */

/**
 * @param { string | undefined } noteId
 * @param { boolean } flush
 * @param { string | undefined } nextId
 * @returns { (id: string) => Exclude<Parameters<ReturnType<typeof defineSidebarNote>>[1], undefined> }
 */
function makeBriefFlags(noteId, flush, nextId) {
	if (noteId) {
		const noteFlags = flush ? 3 : 1;
		return nextId
			? (id) => (nextId === id ? 2 : noteId === id ? noteFlags : 0)
			: (id) => (id === noteId ? noteFlags : 0);
	}
	return nextId ? (id) => (id === nextId ? 2 : 0) : (_id) => 0;
}

/** @param { Document } document */
function makeDefinition(document) {
	const makeSidebarNote = defineSidebarNote(document);
	const skeletonSource = contentById(document, 'note-list__skeleton');
	const emptySource = contentById(document, 'note-list__empty');
	const [contentSource, itemSource] = contentItemPairById(
		document,
		'note-list'
	);

	/**
	 * @param { NotePersist[] | string | undefined } notes
	 * @param { string | undefined } noteId
	 * @param { string | undefined } nextId
	 * @param { boolean } [loading=false]
	 * @param { boolean } [flush=false]
	 */
	return function makeNoteList(
		notes,
		noteId,
		nextId,
		loading = false,
		flush = false
	) {
		if (loading)
			return /** @type {HTMLElement} */ (skeletonSource.cloneNode(true));

		const [list, search] =
			typeof notes === 'string'
				? [undefined, notes.length > 0 ? notes : undefined]
				: [
						Array.isArray(notes) && notes.length > 0 ? notes : undefined,
						undefined,
					];

		if (!list) {
			const content = /** @type {HTMLElement} */ (emptySource.cloneNode(true));
			content.textContent = search
				? `Couldn't find any notes titled "${search}"`
				: 'No notes created yet!';
			return content;
		}

		const content = /** @type {HTMLElement} */ (contentSource.cloneNode(true));
		const toFlags = makeBriefFlags(noteId, flush, nextId);
		for (const info of list) {
			const listItem = /** @type {HTMLLIElement} */ (
				itemSource.cloneNode(true)
			);
			listItem.append(makeSidebarNote(info, toFlags(info.id)));
			content.append(listItem);
		}
		return content;
	};
}

export { makeDefinition };
