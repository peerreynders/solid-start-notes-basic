// file: src/types-note.ts
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

export type NoteBrief = Pick<Note, 'id' | 'title' | 'updatedAt'> & {
	summary: string;
};
