// @ts-check
// file: src/components/note-edit.js
import { contentById } from '../template';
import { onBusy } from '../event-bus';

/** @typedef { import('../internal.d.ts').NotePersist } NotePersist */
/** @typedef { ReturnType<import('./note-preview').makeDefinition> } MakeNotePreview */

const INITIAL_TITLE = 'Untitled';
const INITIAL_BODY = '';

/**
 * @param { Document } document
 * @param { MakeNotePreview } makeNotePreview
 */
function makeDefinition(document, makeNotePreview) {
	const editSource = contentById(document, 'note-edit');

	/**
	 * @param { NotePersist | undefined } note
	 */
	return function makeNoteEdit(note) {
		const content = /** @type {HTMLElement} */ (editSource.cloneNode(true));

		const titleInput = content.querySelector('#note-edit__title');
		if (titleInput instanceof HTMLInputElement) {
			titleInput.value = note ? note.title : INITIAL_TITLE;
		}

		const title = content.querySelector('.c-note-edit__note-title');
		if (title instanceof HTMLElement) {
			title.append(document.createTextNode(note ? note.title : INITIAL_TITLE));
			title.insertAdjacentElement(
				'afterend',
				makeNotePreview(note ? note.html : INITIAL_BODY)
			);
		}

		const deleteButton = content.querySelector('.c-note-edit__delete');
		const doneButton = content.querySelector('.c-note-edit__done');
		if (note) {
			const body = content.querySelector('#note-edit__body');
			if (body instanceof HTMLTextAreaElement) body.textContent = note.body;
		}

		if (
			doneButton instanceof HTMLButtonElement &&
			deleteButton instanceof HTMLButtonElement
		) {
			if (!note) deleteButton.remove();

			/** @type {(busy: boolean) => void} */
			const listener = note
				? (busy) => void (doneButton.disabled = deleteButton.disabled = busy)
				: (busy) => void (doneButton.disabled = busy);

			onBusy(listener);
		}

		return content;
	};
}

export { makeDefinition };
