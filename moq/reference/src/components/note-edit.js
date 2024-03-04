// @ts-check
// file: src/components/note-edit.js
import { contentById } from '../template';

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
	const editSkeletonSource = contentById(document, 'note-edit__skeleton');

	/**
	 * @param { NotePersist | undefined } note
	 * @param { boolean } [isLoading=false]
	 */
	return function makeNoteEdit(note, isLoading) {
		if (isLoading) {
			return /** @type {HTMLElement} */ (editSkeletonSource.cloneNode(true));
		}

		const content = /** @type {HTMLElement} */ (editSource.cloneNode(true));
		const titleInput = content.querySelector('#note-title-input');
		if (titleInput instanceof HTMLInputElement) {
			titleInput.value = note ? note.title : INITIAL_TITLE;
		}
		const title = content.querySelector('.note-title');
		if (title instanceof HTMLElement) {
			title.append(document.createTextNode(note ? note.title : INITIAL_TITLE));
			title.insertAdjacentElement(
				'afterend',
				makeNotePreview(note ? note.html : INITIAL_BODY)
			);
		}

		const deleteButton = content.querySelector('.note-editor-delete');
		const doneButton = content.querySelector('.note-editor-done');
		if (note) {
			const body = content.querySelector('#note-body-input');
			if (body instanceof HTMLTextAreaElement) body.textContent = note.body;
		}

		if (
			doneButton instanceof HTMLButtonElement &&
			deleteButton instanceof HTMLButtonElement
		) {
			if (!note) deleteButton.remove();

			/** @type {(event: CustomEvent<boolean>) => void} disabled */
			const listener = note
				? (event) =>
						void (doneButton.disabled = deleteButton.disabled = event.detail)
				: (event) => void (doneButton.disabled = event.detail);

			document.addEventListener('moq-busy', listener);
		}

		return content;
	};
}

export { makeDefinition };
