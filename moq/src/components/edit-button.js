// @ts-check
// file: src/components/edit-button.js
import { contentById } from '../template';
import { onBusy } from '../event-bus';

/** @param { Document } document */
function makeDefinition(document) {
	const buttonSource = contentById(document, 'edit-button');

	/**
	 *	@param { string } label
	 *	@param { 'new' | 'edit' } kind
	 */
	return function makeEditButton(label, kind) {
		const content = /** @type {HTMLElement} */ (buttonSource.cloneNode(true));

		const child = document.createTextNode(label);
		content.appendChild(child);
		content.classList.add(
			kind === 'new' ? 'js:c-edit-button--new' : 'js:c-edit-button--update'
		);

		if (content instanceof HTMLButtonElement)
			onBusy((busy) => (content.disabled = busy));

		return content;
	};
}

export { makeDefinition };
