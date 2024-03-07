// @ts-check
// file: src/data.js

/** @typedef { import('./internal.d.ts').NotePersist } NotePersist */

const jsonContent = document.getElementById('note-data');
if (!(jsonContent instanceof HTMLScriptElement))
	throw new Error('Unable to locate "note-data" JSON content.');
const noteData = /** @type { NotePersist[] } */ (JSON.parse(jsonContent.text));

(function () {
	if (!Array.isArray(noteData) || noteData.length < 1) return;

	noteData[0].updatedAt = Date.now() - 7200000; // -2hrs
})();

/**
 * @param { Map<string, NotePersist>} collect
 * @param { NotePersist } note
 */
const collectNote = (collect, note) => collect.set(note.id, note);
const noteIndexById = noteData.reduce(collectNote, new Map());

/** @param { string } id */
const noteById = (id) => noteIndexById.get(id);

/** @param { string | undefined } part */
function notesWithTitle(part) {
	if (!part) return noteData;

	const text = part.toLowerCase();
	/** @param { NotePersist } note */
	const predicate = (note) => note.title.toLowerCase().includes(text);
	return noteData.filter(predicate);
}

export { noteById, notesWithTitle };
