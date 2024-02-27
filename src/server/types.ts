// file: src/server/types.ts
import type { Note, NoteInsert, NoteUpdate, NoteBrief } from '../types-note';

export type Content = [title: string, body: string][];

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

function toNoteBrief(note: NotePersist) {
	// Leverage excess property checking
	// https://www.typescriptlang.org/docs/handbook/2/objects.html#excess-property-checks
	const brief: NoteBrief = {
		id: note.id,
		title: note.title,
		updatedAt: note.updatedAt,
		summary: note.excerpt,
	};

	return brief;
}

function toNote(note: NotePersist) {
	// Leverage excess property checking
	const bare: Note = {
		id: note.id,
		title: note.title,
		body: note.body,
		createdAt: note.createdAt,
		updatedAt: note.updatedAt,
	};

	return bare;
}

export { makeNoteStore, toNote, toNoteBrief };
