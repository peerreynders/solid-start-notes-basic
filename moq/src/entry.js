// @ts-check
// file: src/entry.js
import { noteById, notesWithTitle } from './data';
import { urlToParams } from './params';
import { makeDefinition as defineApp } from './components/app';
import { makeDefinition as defineEditButton } from './components/edit-button';
import { makeDefinition as defineNote } from './components/note';
import { makeDefinition as defineBriefList } from './components/brief-list';
import { makeDefinition as defineSearchField } from './components/search-field';

/** typedef { import('./internal.d.ts').NotePersist } NotePersist */

const makeApp = defineApp(document);
const makeEditButton = defineEditButton(document);
const makeNote = defineNote(document, makeEditButton);
const makeBriefList = defineBriefList(document);
const makeSearchField = defineSearchField(document);

/** @param {ReturnType<typeof urlToParams>} param0 */
function assemble({ flushNote, isEditing, nextId, noteId, search }) {
	const notes = notesWithTitle(search);
	const notesOrEmptySearch = notes.length > 0 ? notes : search;
	const note = noteId ? noteById(noteId) : undefined;
	const isLoading = Boolean(nextId);

	return makeApp({
		briefList: makeBriefList(notesOrEmptySearch, note?.id, nextId, flushNote),
		newButton: makeEditButton('New', 'new'),
		note: makeNote(note, isEditing),
		searchField: makeSearchField(search, isLoading),
	});
}

const state = urlToParams(new URL(document.location.href));
document.title = state.title;
const body = /** @type {HTMLBodyElement} */ (document.querySelector('body'));
body.prepend(assemble(state));
