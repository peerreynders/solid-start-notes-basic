// file: src/components/app-context.tsx

// NOTE: Core state is **represented** via the route
// while the application context is the hub for
// ephemeral (extended) state.
// Ephemeral state isn't relevant to SSR.

import {
	createContext,
	createSignal,
	useContext,
	type ParentProps,
} from 'solid-js';

export type LastEdit = ['new'] | ['edit', string] | ['delete', string];

// Primitives over features …
const [lastEdit, sendLastEdit] = createSignal<LastEdit | undefined>(undefined, {
	equals: false,
});

export type LastEditHolder = {
	lastEdit: typeof lastEdit;
};
export type SendLastEditHolder = {
	sendLastEdit: typeof sendLastEdit;
};

const context = {
	lastEdit,
	sendLastEdit,
};

const AppContext = createContext(context);

const AppProvider = (props: ParentProps) => (
	<AppContext.Provider value={context}>{props.children}</AppContext.Provider>
);

function useAppContext() {
	const ctx = useContext(AppContext);
	if (!ctx) throw new Error('AppContext not initialized');

	return ctx;
}

const useLastEdit = (): LastEditHolder => useAppContext();

const useSendLastEdit = (): SendLastEditHolder => useAppContext();

export { AppProvider, useLastEdit, useSendLastEdit };
