// @ts-check
// file: src/components/search-field.js
import { contentById } from '../template';

/** @param { Document } document */
function makeDefinition(document) {
	const spinnerSource = contentById(document, 'spinner');
	const searchFieldSource = contentById(document, 'search-field');

	/**
	 * @param { string | undefined } search
	 * @param { boolean } [loading = false]
	 */
	return function makeSearchField(search, loading = false) {
		const spinner = /** @type {HTMLElement} */ (spinnerSource.cloneNode(true));
		const content = /** @type {HTMLElement} */ (
			searchFieldSource.cloneNode(true)
		);

		if (search) {
			const input = content.querySelector('#sidebar-search-input');
			if (!(input instanceof HTMLInputElement))
				throw new Error(
					'Failed to find "#sidebar-search-input" input in "search-field" content'
				);
			input.value = search;
		}

		if (loading) {
			spinner.classList.add('spinner--active');
			spinner.setAttribute('aria-busy', 'true');
		}

		content.append(spinner);
		return content;
	};
}

export { makeDefinition };
