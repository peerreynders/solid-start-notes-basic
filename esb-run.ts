/* selectNotesInTitle, selectNoteWithId */
import { insertNote } from './src/server/repo';

// selectNotesInTitle('very long title').then((notes) => console.log(notes));
// selectNoteWithId('ehWBGzE_rTxHsD6aWKv8g').then((note) => console.log(note ? note : 'UNDEFINED'));
insertNote({ title: 'New Title', body: 'New Body'}).then((note) => console.log(note ? note : 'UNDEFINED'));




