// file: src/server/api.ts
'use server';
import { selectNotesInTitle } from './repo';
import { makeNoteBrief, type Note } from './types';
import { excerpt } from './excerpt';

const noteToBrief = (note: Note) =>
	makeNoteBrief(note.id, note.title, note.updatedAt, excerpt(note.body));
const toBriefs = (notes: Note[]) => notes.map(noteToBrief);

function getBriefs(search: string | undefined) {
	return selectNotesInTitle(search).then(toBriefs);
}

export { getBriefs };
