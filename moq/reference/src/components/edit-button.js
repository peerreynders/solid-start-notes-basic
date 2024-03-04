// @ts-check
// file: src/components/edit-button.js
import { contentById } from '../template';

/** @param { Document } document */
function makeDefinition(document) {
	const buttonSource = contentById(document, 'edit-button');

	/**
	 *	@param { string } label
	 *	@param { boolean } [isDraft = false]
	 *	@param { boolean } [isDisabled = false]
	 */
	return function makeEditButton(label, isDraft = false, isDisabled = false) {
		const content = /** @type {HTMLElement} */ (buttonSource.cloneNode(true));

		const child = document.createTextNode(label);
		content.appendChild(child);

		if (isDraft)
			content.classList.replace('edit-button--solid', 'edit-button--outline');

		if (isDisabled) content.setAttribute('disabled', '');

		if (content instanceof HTMLButtonElement)
			document.addEventListener(
				'moq-busy',
				(event) => (content.disabled = event.detail)
			);

		return content;
	};
}

export { makeDefinition };
