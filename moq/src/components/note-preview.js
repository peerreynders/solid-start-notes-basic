// @ts-check
// file: src/components/note-preview.js
import { contentById } from '../template';

/** @param { Document } document */
function makeDefinition(document) {
	const previewSource = contentById(document, 'note-preview');

	/** @param { string } noteHtml */
	return function makeNotePreview(noteHtml) {
		const content = /** @type {HTMLElement} */ (previewSource.cloneNode(true));
		const wrapper = content.querySelector('.o-from-markdown');
		if (wrapper instanceof HTMLElement) {
			wrapper.innerHTML = noteHtml;
		}
		return content;
	};
}

export { makeDefinition };
