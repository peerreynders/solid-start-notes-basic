// file: src/server/api.ts
'use server';
import { selectNotesInTitle } from './repo';
import { makeNoteBrief, type Note } from './types';

const noteToBrief = (note: Note) =>
	makeNoteBrief(note.id, note.title, note.updatedAt, note.excerpt);
const toBriefs = (notes: Note[]) => notes.map(noteToBrief);

const delay =
	<T>(delayMs: number) =>
	(value: T) => {
		return new Promise<T>((resolve, _reject) => {
			setTimeout(resolve, delayMs, value);
		});
	};

function getBriefs(search: string | undefined) {
	return selectNotesInTitle(search).then(toBriefs).then(delay(2000));
}

export { getBriefs };
