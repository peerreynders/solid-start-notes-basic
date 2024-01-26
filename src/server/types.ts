// file: src/server/types.ts
export type Content = [title: string, body: string][];

export type NoteInsert = {
	title: string;
	body: string;
};

export type NoteUpdate = {
	id: string;
} & NoteInsert;

export type Note = NoteUpdate & {
	createdAt: number;
	updatedAt: number;
};

export type NotePersistInsert = {
	excerpt: string;
} & NoteInsert;

export type NotePersistUpdate = {
	excerpt: string;
} & NoteUpdate;

export type NotePersist = {
	excerpt: string;
} & Note;

export type NotePersistTransform = (
	content: Content[number],
	excerpt: string,
	createdAt: number, // milliseconds since ECMAScript epoch
	updatedAt: number,
	noteCallback: (note: NotePersist) => void,
	error: (err: Error) => void
) => void;

const makeNoteStore = (notes: NotePersist[]) =>
	({ kind: 'note-store', notes }) as const;

export type NoteStore = ReturnType<typeof makeNoteStore>;

const toNoteBrief = (note: NotePersist) => ({
	id: note.id,
	title: note.title,
	updatedAt: note.updatedAt,
	summary: note.excerpt,
});

export type NoteBrief = ReturnType<typeof toNoteBrief>;

const toNote = (note: NotePersist) => ({
	id: note.id,
	title: note.title,
	body: note.body,
	createdAt: note.createdAt,
	updatedAt: note.updatedAt,
});

export { makeNoteStore, toNote, toNoteBrief };
