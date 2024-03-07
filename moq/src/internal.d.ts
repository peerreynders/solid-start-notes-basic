interface CustomEventMap {
	'moq-busy': CustomEvent<boolean>;
}

declare global {
	interface Document {
		addEventListener<K extends keyof CustomEventMap>(
			type: K,
			listener: (this: Document, ev: CustomEventMap[K]) => void
		): void;
		dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
	}
}

export type NotePersist = {
	id: string;
	title: string;
	body: string;
	excerpt: string;
	html: string;
	createdAt: number;
	updatedAt: number;
};
