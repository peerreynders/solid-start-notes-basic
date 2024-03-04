// @ts-check
// file: src/components/note-list.js
import { contentById } from '../template';
import { makeBriefDateFormat } from '../date-time';

/** @typedef { import('../internal.d.ts').NotePersist } NotePersist */

const NAME_FLUSH = 'flash';

const updateFormat = makeBriefDateFormat(
	Intl.DateTimeFormat().resolvedOptions()
);

/** @typedef { 0 | 1 | 2 | 3 } BriefFlags */

/** @param { BriefFlags } flags */
const isActive = (flags) => (flags & 0b01) === 0b01;
/** @param { BriefFlags } flags */
const isNext = (flags) => flags === 2;
/** @param { BriefFlags } flags */
const isFlush = (flags) => flags === 3;

/** @param { Document } document */
function makeDefinition(document) {
	const briefSource = contentById(document, 'sidebar-note');

	const sendBusyStart = () =>
		document.dispatchEvent(new CustomEvent('moq-busy', { detail: true }));
	const sendBusyEnd = () =>
		document.dispatchEvent(new CustomEvent('moq-busy', { detail: false }));

	/**
	 * @param { NotePersist } note
	 * @param { BriefFlags } [flags]
	 */
	return function makeSidebarNote(note, flags = 0) {
		const content = /** @type {HTMLElement} */ (briefSource.cloneNode(true));

		// fill header fields
		const header = content.querySelector('header');
		if (header instanceof HTMLElement) {
			const title = content.querySelector('strong');
			if (title instanceof HTMLElement) {
				const child = document.createTextNode(note.title);
				title.appendChild(child);
			}

			const updated = content.querySelector('small');
			if (updated instanceof HTMLElement) {
				const [timeOrDate] = updateFormat(note.updatedAt);
				const child = document.createTextNode(timeOrDate);
				updated.appendChild(child);
			}
		}
		// Fill excerpt
		const excerpt = content.querySelector('.sidebar-note-excerpt');
		if (excerpt instanceof HTMLElement) {
			const child = document.createTextNode(note.excerpt);
			excerpt.replaceChildren(child);
		}

		// Expand button & expanded children
		const buttonExpand = content.querySelector('.sidebar-note-toggle-expand');
		/** @type { HTMLElement[] } */
		const childrenExpand = [];
		if (buttonExpand instanceof HTMLButtonElement) {
			const expand = buttonExpand.querySelector('[alt="expand" i]');
			const collapse = buttonExpand.querySelector('[alt="collapse" i]');
			if (expand instanceof HTMLElement) {
				childrenExpand[0] = expand;
				if (collapse instanceof HTMLElement) {
					childrenExpand[1] = collapse;
				}
			}
		}

		if (excerpt && buttonExpand && childrenExpand.length === 2) {
			buttonExpand.removeChild(childrenExpand[1]);
			content.removeChild(excerpt);

			buttonExpand.addEventListener('click', () => {
				if (!excerpt.parentNode) {
					content.classList.add('note-expanded');
					content.append(excerpt);
					buttonExpand.replaceChild(childrenExpand[1], childrenExpand[0]);
					return;
				}
				buttonExpand.replaceChild(childrenExpand[0], childrenExpand[1]);
				content.removeChild(excerpt);
				content.classList.remove('note-expanded');
			});
		}

		// Open button
		const buttonOpen = content.querySelector('.sidebar-note-open');
		if (buttonOpen instanceof HTMLButtonElement) {
			const active = isActive(flags);
			const bgColor = isNext(flags)
				? 'var(--gray-80)'
				: active
					? 'var(--tertiary-blue)'
					: undefined;
			const border = active ? '1px solid var(--primary-border)' : undefined;

			if (bgColor) buttonOpen.style.backgroundColor = bgColor;
			if (border) buttonOpen.style.border = border;
		}

		// add flushing-note-to-server animation
		if (isFlush(flags)) {
			function startFlush() {
				content.classList.add(NAME_FLUSH);
				sendBusyStart();
			}

			/** @param { AnimationEvent } event */
			function endListener(event) {
				if (event.animationName === NAME_FLUSH) {
					content.classList.remove(NAME_FLUSH);
					sendBusyEnd();

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

export { makeDefinition };
