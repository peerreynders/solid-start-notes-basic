/* insertNote, selectNotesInTitle, selectNote, updateNote */
import { selectNote, deleteNote } from './src/server/repo';

import type { Note } from './src/server/types';

// const notesIndex = (id: Note['id']) => (notes: Note[]) => console.log('@', idIndex(notes, id));
// const idIndex = (note: Note[], id: Note['id']) => note.findIndex((note) => note.id === id);
const showNote = (note: Note | undefined) => 
	console.log('Returned: ', note ? note : 'UNDEFINED') 

function doDelete(id: Note['id']) {
	selectNote(id).then((note) => console.log('Found:', note));
  return deleteNote(id);
}

const runDelete = (id: Note['id']) => doDelete(id).then(showNote);

// selectNotesInTitle('very long title').then((notes) => console.log(notes));
// selectNote('ehWBGzE_rTxHsD6aWKv8g').then((note) => console.log(note ? note : 'UNDEFINED'));
// insertNote({ title: 'New Title', body: 'New Body'}).then((note) => console.log(note ? note : 'UNDEFINED'));
runDelete('-fPyFKFS6GwgyaBtKSfVN');
//updateNote({ id: 'Ymp4MgWr9QRpKGhR4nCVs', title: 'Updated Title', body: 'Updated Body'}).then((note) => console.log(note ? note : 'UNDEFINED'));




