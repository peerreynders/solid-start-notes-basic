// file: src/server/api.ts
'use server';
import { selectNote, selectNotesInTitle } from './repo';
import { toNote, toNoteBrief, type NotePersist } from './types';

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

function getBriefs(search: string | undefined) {
	return selectNotesInTitle(search).then(toBriefs);
}

const toMaybeNote = (note: NotePersist | undefined) =>
	note ? toNote(note) : undefined;

function getNote(id: string) {
	return selectNote(id).then(toMaybeNote);
}

export { getBriefs, getNote };
