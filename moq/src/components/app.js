// @ts-check
// file: src/components/app.js
import { contentById } from '../template';

/** @param { Document } document */
function makeDefinition(document) {
	const appSource = contentById(document, 'app');

	/**
	 * @param {{
	 *		briefList: HTMLElement;
	 *		newButton: HTMLElement;
	 *		note: HTMLElement;
	 *		searchField: HTMLElement;
	 *	}} param0
	 */
	return function makeApp({ briefList, newButton, note, searchField }) {
		const content = /** @type {HTMLElement} */ (appSource.cloneNode(true));

		const menu = content.querySelector('.c-sidebar__menu');
		if (!menu)
			throw new Error('Failed to find ".c-sidebar__menu" in "app" content');
		menu.append(searchField);
		menu.append(newButton);
		menu.insertAdjacentElement('afterend', briefList);

		const noteView = content.querySelector('.c-note-view');
		if (!noteView)
			throw new Error('Failed to find "c-note-view" in "app" content');
		noteView.append(note);

		return content;
	};
}

export { makeDefinition };
