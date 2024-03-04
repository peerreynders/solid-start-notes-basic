// @ts-check
// file: src/entry.js
import { noteById, notesWithTitle } from './data';
import { urlToParams } from './params';
import { makeDefinition as defineApp } from './components/app.js';
import { makeDefinition as defineEditButton } from './components/edit-button.js';
import { makeDefinition as defineNote } from './components/note.js';
import { makeDefinition as defineNoteList } from './components/note-list.js';
import { makeDefinition as defineSearchField } from './components/search-field.js';

/** @typedef { import('./internal.d.ts').NotePersist } NotePersist */

const makeApp = defineApp(document);
const makeEditButton = defineEditButton(document);
const makeNote = defineNote(document, makeEditButton);
const makeNoteList = defineNoteList(document);
const makeSearchField = defineSearchField(document);

/**
 * @param { boolean } isEditing
 * @param { string | undefined } nextId
 * @returns { Exclude<Parameters<typeof makeNote>[1], undefined> }
 */
const toNoteFlags = (isEditing, nextId) =>
	isEditing ? (nextId ? 3 : 1) : nextId ? 2 : 0;

/** @param {ReturnType<typeof urlToParams>} param0 */
function assemble({
	flushNote,
	isEditing,
	listLoading,
	nextId,
	noteId,
	search,
}) {
	const notes = listLoading
		? undefined
		: ((r) => (r.length > 0 ? r : search))(notesWithTitle(search));
	const note = noteId ? noteById(noteId) : undefined;

	const loading =
		listLoading || (typeof nextId === 'string' && nextId.length > 0);

	return makeApp({
		searchField: makeSearchField(search, loading),
		newButton: makeEditButton('New'),
		noteList: makeNoteList(notes, note?.id, nextId, listLoading, flushNote),
		note: makeNote(note, toNoteFlags(isEditing, nextId)),
	});
}

document.title = 'React Notes';
const body = /** @type {HTMLBodyElement} */ (document.querySelector('body'));
body.prepend(assemble(urlToParams(new URL(document.location.href))));
