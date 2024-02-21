// file: src/server/api.ts
'use server';
import {
	deleteNote as deleteNoteById,
	insertNote,
	selectNote,
	selectNotesInTitle,
	updateNote,
} from './repo';
import { toNote, toNoteBrief, type NotePersist } from './types';
import { excerptFrom } from './excerpt';
/*
const delay =
	<T>(delayMs: number) =>
	(value: T) => {
		return new Promise<T>((resolve, _reject) => {
			setTimeout(resolve, delayMs, value);
		});
	};
*/
const toBriefs = (notes: NotePersist[]) => notes.map(toNoteBrief);

const getBriefs = (search: string | undefined) =>
	selectNotesInTitle(search).then(toBriefs);

const toMaybeNote = (note: NotePersist | undefined) =>
	note ? toNote(note) : undefined;

const getNote = (id: string) =>
	selectNote(id).then(toMaybeNote); /*.then(delay(2000))*/

function upsertNote(title: string, body: string, id?: string) {
	const excerpt = excerptFrom(body);
	return (
		typeof id === 'string' && id.length > 0
			? updateNote({ id, title, body, excerpt })
			: insertNote({ title, body, excerpt })
	).then(toMaybeNote);
}

const deleteNote = (noteId: string) =>
	deleteNoteById(noteId).then((note) => note?.id === noteId);

export { deleteNote, getBriefs, getNote, upsertNote };
