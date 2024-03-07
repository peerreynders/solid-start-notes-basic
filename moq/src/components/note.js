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

/**
 * @param { Document } document
 * @param { MakeButton } makeButton
 */
function makeDefinition(document, makeButton) {
	const noteSource = contentById(document, 'note');
	const noteNoneSource = contentById(document, 'note-none');

	const makeNotePreview = defineNotePreview(document);
	const makeNoteEdit = defineNoteEdit(document, makeNotePreview);

	/**
	 *	@param { NotePersist | undefined } note
	 *	@param { boolean } isEditing
	 */
	return function makeNote(note, isEditing) {
		if (isEditing) return makeNoteEdit(note);

		if (!note)
			return /** @type {HTMLElement} */ (noteNoneSource.cloneNode(true));

		// Note view
		const content = /** @type {HTMLElement} */ (noteSource.cloneNode(true));

		const title = content.querySelector('h1');
		if (title instanceof HTMLElement)
			title.appendChild(document.createTextNode(note.title));

		const menu = content.querySelector('.c-note__menu');
		if (menu instanceof HTMLElement) {
			const updated = content.querySelector('time');
			if (updated instanceof HTMLTimeElement) {
				const [updatedOn, dateTime] = updateFormat(note.updatedAt);
				updated.dateTime = dateTime;
				updated.appendChild(document.createTextNode(updatedOn));
			}

			menu.append(makeButton('Edit', 'edit'));
		}

		content.append(makeNotePreview(note.html));

		return content;
	};
}

export { makeDefinition };
