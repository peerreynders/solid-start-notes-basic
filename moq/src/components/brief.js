// @ts-check
// file: src/components/note-list.js
import { contentById } from '../template';
import { sendBusy } from '../event-bus';
import { makeBriefDateFormat } from '../date-time';

/** @typedef { import('../internal.d.ts').NotePersist } NotePersist */

const NAME_FLUSH = 'js:c-brief--flash';

/** @typedef { 0 | 1 | 2 | 3 } BriefFlags */

/** @param { BriefFlags } flags */
const isActive = (flags) => (flags & 0b01) === 0b01;
/** @param { BriefFlags } flags */
const isNext = (flags) => flags === 2;
/** @param { BriefFlags } flags */
const isFlush = (flags) => flags === 3;

/**
 * @param { string | undefined } noteId
 * @param { boolean } flush
 * @param { string | undefined } nextId
 * @returns { (id: string) => BriefFlags }
 */
function makeBriefFlags(noteId, flush, nextId) {
	if (noteId) {
		const noteFlags = flush ? 3 : 1;
		return nextId
			? (id) => (nextId === id ? 2 : noteId === id ? noteFlags : 0)
			: (id) => (id === noteId ? noteFlags : 0);
	}
	return nextId ? (id) => (id === nextId ? 2 : 0) : (_id) => 0;
}

const updateFormat = makeBriefDateFormat(
	Intl.DateTimeFormat().resolvedOptions()
);

/** @param { Document } document */
function makeDefinition(document) {
	const briefSource = contentById(document, 'brief');

	/**
	 * @param { NotePersist } note
	 * @param { BriefFlags } [flags]
	 */
	return function makeSidebarNote(note, flags = 0) {
		const content = /** @type {HTMLElement} */ (briefSource.cloneNode(true));
		content.dataset.noteId = note.id;

		// fill header fields
		const header = content.querySelector('header');
		if (header instanceof HTMLElement) {
			const title = header.querySelector('strong');
			if (title instanceof HTMLElement)
				title.appendChild(document.createTextNode(note.title));

			const updated = header.querySelector('time');
			if (updated instanceof HTMLTimeElement) {
				const [timeOrDate, dateTime] = updateFormat(note.updatedAt);
				updated.dateTime = dateTime;
				updated.appendChild(document.createTextNode(timeOrDate));
			}
		}

		// Fill excerpt
		const excerpt = content.querySelector('.c-brief__summary');
		if (excerpt instanceof HTMLElement && note.excerpt)
			excerpt.replaceChildren(document.createTextNode(note.excerpt));

		// Expand/Collapse toggle
		const summaryState = content.querySelector('input');
		const summaryToggle = content.querySelector('label');
		if (
			summaryState instanceof HTMLInputElement &&
			summaryToggle instanceof HTMLLabelElement
		) {
			summaryState.id = summaryState.id + note.id;
			summaryToggle.htmlFor = summaryState.id;
		}

		// Open button
		const buttonOpen = content.querySelector('.c-brief__open');
		if (buttonOpen instanceof HTMLButtonElement) {
			const className = isNext(flags)
				? 'c-brief--pending'
				: isActive(flags)
					? 'c-brief--active'
					: undefined;
			if (className) buttonOpen.classList.add(className);
		}

		// add flushing-note-to-server animation
		if (isFlush(flags)) {
			function startFlush() {
				content.classList.add(NAME_FLUSH);
				sendBusy(true);
			}

			/** @param { AnimationEvent } event */
			function endListener(event) {
				if (event.animationName === 'flash') {
					content.classList.remove(NAME_FLUSH);
					sendBusy(false);

					setTimeout(startFlush, 3000);
					return;
				}
			}

			content.addEventListener('animationend', endListener);
			startFlush();
		}

		return content;
	};
}

export { makeBriefFlags, makeDefinition };
