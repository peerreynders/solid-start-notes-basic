// @ts-check
// file: src/event-bus.js

/** @param { (busy: boolean) => void } listener */
function onBusy(listener) {
	document.addEventListener('moq-busy', (event) => listener(event.detail));
}

/** @param { boolean } busy */
const sendBusy = (busy) =>
	document.dispatchEvent(new CustomEvent('moq-busy', { detail: busy }));

export { onBusy, sendBusy };
