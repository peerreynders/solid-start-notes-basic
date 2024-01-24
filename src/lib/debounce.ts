// file: src/lib/debounce.ts
import { getOwner, onCleanup } from 'solid-js';
import { isServer } from 'solid-js/web';

// https://github.com/solidjs-community/solid-primitives/blob/e171bd3b2348a2a7a606902f0b647c14f86cce0e/packages/scheduled/src/index.ts

export interface Scheduled<Args extends unknown[]> {
	(...args: Args): void;
	clear: VoidFunction;
}

export type ScheduleCallback = <Args extends unknown[]>(
	callback: (...args: Args) => void,
	wait?: number
) => Scheduled<Args>;

const debounce: ScheduleCallback = (callback, wait) => {
	if (isServer) {
		return Object.assign(() => void 0, { clear: () => void 0 });
	}
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	const clear = () => clearTimeout(timeoutId);
	if (getOwner()) onCleanup(clear);
	const debounced: typeof callback = (...args) => {
		if (timeoutId !== undefined) clear();
		timeoutId = setTimeout(() => callback(...args), wait);
	};
	return Object.assign(debounced, { clear });
};

export { debounce };
