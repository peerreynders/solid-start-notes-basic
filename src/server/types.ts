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

export type NoteTransform = (
	content: Content[number],
	createdAt: number, // milliseconds since ECMAScript epoch
	updatedAt: number,
	noteCallback: (note: Note) => void,
	error: (err: Error) => void
) => void;

const makeNoteStore = (notes: Note[]) =>
	({ kind: 'note-store', notes }) as const;

export type NoteStore = ReturnType<typeof makeNoteStore>;

const makeNoteBrief = (
	id: Note['id'],
	title: Note['title'],
	updatedAt: number,
	summary = ''
) => ({ id, title, updatedAt, summary });

export type NoteBrief = ReturnType<typeof makeNoteBrief>;

export { makeNoteBrief, makeNoteStore };
