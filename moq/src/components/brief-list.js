// @ts-check
// file: src/components/note-list.js
import { contentById, contentItemPairById } from '../template';
import { makeBriefFlags, makeDefinition as defineBrief } from './brief';

/** @typedef { import('../internal.d.ts').NotePersist } NotePersist */

/** @param { Document } document */
function makeDefinition(document) {
	const makeBrief = defineBrief(document);
	const emptySource = contentById(document, 'brief-list__empty');
	const [contentSource, itemSource] = contentItemPairById(
		document,
		'brief-list'
	);

	/**
	 * @param { NotePersist[] | string | undefined } notes
	 * @param { string | undefined } noteId
	 * @param { string | undefined } nextId
	 * @param { boolean } [flush=false]
	 */
	return function makeBriefList(notes, noteId, nextId, flush = false) {
		const content = /** @type {HTMLElement} */ (contentSource.cloneNode(true));
		const [list, search] =
			typeof notes === 'string'
				? [undefined, notes.length > 0 ? notes : undefined]
				: [
						Array.isArray(notes) && notes.length > 0 ? notes : undefined,
						undefined,
					];

		if (!list) {
			const empty = /** @type {HTMLElement} */ (emptySource.cloneNode(true));
			empty.appendChild(
				document.createTextNode(
					search
						? `Couldn't find any notes titled "${search}"`
						: 'No notes created yet!'
				)
			);
			content.replaceChildren(empty);
			return content;
		}

		const listRoot = content.firstElementChild;
		if (listRoot) {
			const toFlags = makeBriefFlags(noteId, flush, nextId);
			for (const info of list) {
				const listItem = /** @type {HTMLLIElement} */ (
					itemSource.cloneNode(true)
				);
				listItem.append(makeBrief(info, toFlags(info.id)));
				listRoot.append(listItem);
			}
		}
		return content;
	};
}

export { makeDefinition };
