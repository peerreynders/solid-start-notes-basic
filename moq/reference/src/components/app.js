// @ts-check
// file: src/components/app.js
import { contentById } from '../template';

/** @param { Document } document */
function makeDefinition(document) {
	const appSource = contentById(document, 'app');

	/** @param {{
	 *		newButton: HTMLElement;
	 *		note: HTMLElement;
	 *		noteList: HTMLElement;
	 *		searchField: HTMLElement;
	 *	}} param0
	 */
	return function makeApp({ newButton, note, noteList, searchField }) {
		const content = /** @type {HTMLElement} */ (appSource.cloneNode(true));

		const menu = content.querySelector('.sidebar-menu');
		if (!menu)
			throw new Error('Failed to find ".sidebar-menu" in "app" content');
		menu.append(searchField);
		menu.append(newButton);

		const nav = content.querySelector('nav');
		if (!nav) throw new Error('Failed to find "nav" in "app" content');
		nav.append(noteList);

		const noteView = content.querySelector('.note-viewer');
		if (!noteView)
			throw new Error('Failed to find "note-viewer" in "app" content');
		noteView.append(note);

		return content;
	};
}

export { makeDefinition };
