// @ts-check
// file: src/components/edit-button.js
import { contentById } from '../template';
import { makeNoteDateFormat } from '../date-time';
import { makeDefinition as defineNoteEdit } from './note-edit';
import { makeDefinition as defineNotePreview } from './note-preview';

/** @typedef { import('../internal.d.ts').NotePersist } NotePersist */
/** @typedef { ReturnType<import('./edit-button').makeDefinition> } MakeButton */

const updateFormat = makeNoteDateFormat(
	Intl.DateTimeFormat().resolvedOptions()
);

const makeNotePreview = defineNotePreview(document);
const makeNoteEdit = defineNoteEdit(document, makeNotePreview);

/** @typedef { 0 | 1 | 2 | 3 } NoteFlags */

/** @param { NoteFlags } flags */
const isLoading = (flags) => (flags & 0x2) === 0x2;
/** @param { NoteFlags } flags */
const isEditing = (flags) => (flags & 0x1) === 0x1;

/**
 * @param { Document } document
 * @param { MakeButton } makeButton
 */
function makeDefinition(document, makeButton) {
	const noteSource = contentById(document, 'note');
	const noteSkeletonSource = contentById(document, 'note__skeleton');
	const noteNoneSource = contentById(document, 'note__none');

	/**
	 *	@param { NotePersist | undefined } note
	 *	@param { NoteFlags } flags
	 */
	return function makeNote(note, flags = 0) {
		const loading = isLoading(flags);
		if (isEditing(flags)) return makeNoteEdit(note, loading);

		if (loading)
			return /** @type {HTMLElement} */ (noteSkeletonSource.cloneNode(true));

		if (!note)
			return /** @type {HTMLElement} */ (noteNoneSource.cloneNode(true));

		// Note view
		const content = /** @type {HTMLElement} */ (noteSource.cloneNode(true));
		const title = content.querySelector('.note-title');
		if (title instanceof HTMLElement) {
			const child = document.createTextNode(note.title);
			title.appendChild(child);
		}
		const updated = content.querySelector('.note-updated-at');
		if (updated instanceof HTMLElement) {
			const text = updated.firstChild;
			if (text instanceof Text) {
				const [updatedOn] = updateFormat(note.updatedAt);
				text.nodeValue = text.nodeValue + ' ' + updatedOn;
			}
		}
		const menu = content.querySelector('.note-menu');
		if (menu instanceof HTMLElement) {
			menu.append(makeButton('Edit'));
		}
		content.append(makeNotePreview(note.html));
		return content;
	};
}

export { makeDefinition };
