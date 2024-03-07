// @ts-check
// file: src/components/search-field.js
import { contentById } from '../template';

/** @param { Document } document */
function makeDefinition(document) {
	const searchFieldSource = contentById(document, 'search-field');

	/**
	 * @param { string | undefined } search
	 * @param { boolean } [isLoading = false]
	 */
	return function makeSearchField(search, isLoading = false) {
		const content = /** @type {HTMLElement} */ (
			searchFieldSource.cloneNode(true)
		);

		if (search) {
			const input = content.querySelector('#search-field__search');
			if (!(input instanceof HTMLInputElement))
				throw new Error(
					'Failed to find "#search-field__search" input in "search-field" content'
				);
			input.value = search;
		}

		const spinner = content.querySelector('.c-spinner');
		if (spinner instanceof HTMLElement && isLoading) {
			spinner.classList.add('c-spinner--active');
			spinner.setAttribute('aria-busy', 'true');
		}

		return content;
	};
}

export { makeDefinition };
