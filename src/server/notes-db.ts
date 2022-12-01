import { Low, JSONFile } from 'lowdb';
import { nanoid } from 'nanoid';
import { makeNotes } from './notes-seed';
import type { Note, NoteInsert, NoteUpdate } from '../types';

type Data = {
  notes: Note[];
}

// Note: A task is synchronous
type Task<T> = (notes: Note[]) => T;

const FILENAME = 'notes-db.json';
const SAVE_DELAY = 500;

let running: Low<Data> | undefined;
let saveSubmitted = false; 
let saveId: ReturnType<typeof setTimeout> | undefined;
let queuedId: ReturnType<typeof setTimeout> | undefined;
const taskQueue: Task<unknown>[] = [];

/* --- Sync Functions --- */
// i.e. don't make them async

function runQueue() {
  if (typeof running === 'undefined' || !running.data )
    throw new Error('notes-db not started');

  queuedId = undefined;

  const notes = running.data.notes;
  for (const runTask of taskQueue) {
    runTask(notes);
  }
  // truncate task queue
  taskQueue.length = 0;
}

function scheduleQueue() {
  if (typeof queuedId !== 'undefined') return;
  queuedId = setTimeout(runQueue);
}

function saveDbFn(_notes: unknown) {
  saveSubmitted = false;

  if (typeof running === 'undefined') throw new Error('Save on absent Database');
  // this is async
  running.write();
}

function submitSave() {
  saveSubmitted = true;
  saveId = undefined;
  submitTask(saveDbFn);
}

function scheduleSave() {
  if (saveSubmitted) return;

  if (typeof saveId !== 'undefined') {
    // delay the save
    clearTimeout(saveId);    
  };
  saveId = setTimeout( submitSave, SAVE_DELAY);
}

// Keep control over Note creation
// when seeding the notes
function noteTemplate(
  [title, body]: [string, string], 
  created: Date, 
  updated: Date
): Note {
  return {
    id: nanoid(),
    title,
    body,
    createdAt: created.toISOString(),
    updatedAt: updated.toISOString(),
  };
}

// Defensive copy of Note object
// all properties are (primitive) immutable
function cloneNote (
  { id, title, body, createdAt, updatedAt }: Note
): Note {
  return {
    id,
    title,
    body,
    createdAt,
    updatedAt
  };
}

type TimeIndex = {
  time: number;
  note: Note;
};

function compareTimeDesc(
  { time: timeA }: TimeIndex, 
  { time: timeB }: TimeIndex 
) {
  return timeB - timeA;
}

const toUpdatedIndex = (note: Note): TimeIndex => ({ 
  note: note, 
  time: (new Date(note.updatedAt)).getTime()
});

const timeIndexClone = (i: TimeIndex) => cloneNote(i.note);

function orderByUpdateClone(notes: Note[]) {
  const indexed = notes.map(toUpdatedIndex);
  indexed.sort(compareTimeDesc);
  return indexed.map(timeIndexClone);
}

function searchNotesFn(notes: Note[], searchText: string) {
  const search = searchText.toLowerCase();
  const titleLike = ({ title }: Note) => {
    return title.toLowerCase().includes(search);
  };
  const selected = searchText ? notes.filter(titleLike) : notes;
  return orderByUpdateClone(selected);
  // return selected.map(cloneNote);
}

function findNoteByIdFn(notes: Note[], id: string) {
  const byId = (note: Note) => note.id === id;
  const i = notes.findIndex(byId);

  // JSON doesn't support `undefined` ut it supports `null`
  return i > -1 ? cloneNote(notes[i]) : null;
}

function deleteNoteByIdFn(notes: Note[], id: string) {
  const byId = (note: Note) => note.id === id;
  const i = notes.findIndex(byId);

  if (i < 0) return 0;

  notes.splice(i, 1);
  scheduleSave();

  return 1;
}

function insertNoteFn(notes: Note[], { title, body } : NoteInsert) {
  const now = (new Date()).toISOString();	
  const note: Note = {
    id: nanoid(),
    title,
    body,
    createdAt: now,
    updatedAt: now,
  };

  notes.push(note);
  scheduleSave();

  return note.id;
}

function updateNoteFn(notes: Note[], updated: NoteUpdate) {
  const byId = (note: Note) => note.id === updated.id;
  const i = notes.findIndex(byId);

  if (i < 0) return null;
  const target = notes[i];

  if (target.title !== updated.title) target.title = updated.title; 
  if (target.body !== updated.body) target.body = updated.body; 
  target.updatedAt = (new Date()).toISOString();
  scheduleSave();

  return target.id;
}

/* --- Async functions --- */

function waitForDb(): Promise<Low<Data>> {
  return new Promise((resolve, reject) => {
    let i = 10;
    const wait = () => {
      if(typeof running !== 'undefined') {
        resolve(running);

      } else {
        --i;
	if (i > 0) setTimeout(wait, 50);
        else reject(new Error('waitForDb: Timed out'));
      }	      
    };

    wait();
  });
}

function submitTask<T = void>(task: Task<T>): Promise<T> {
  const p = new Promise<T>((resolve, reject) => {
    const runTask = (notes: Note[]) => {
      try {
        resolve(task(notes));
      } catch (error) {
        reject(error);
      }
    };

    taskQueue.push(runTask);
  });

  scheduleQueue();
  return p;
}

async function start() {
  if (running) return;

  const adapter = new JSONFile<Data>(FILENAME);
  const newDb = new Low(adapter);

  await newDb.read();
  if (newDb.data === null) {
    // seed data
    const notes = makeNotes(noteTemplate);
    newDb.data = { notes };
    await newDb.write();
  }
  running = newDb;
}

async function waitForTask<T>(task: Task<T>): Promise<T> {
  if (typeof running === 'undefined') {
    await waitForDb();
  }
  return submitTask(task);
}

const searchNotes = async (searchText: string): Promise<Note[]> => 
  waitForTask((notes: Note[]) => searchNotesFn(notes, searchText));

const findNoteById = async (id: string): Promise<Note | null> => 
  waitForTask((notes: Note[]) => findNoteByIdFn(notes, id));

const deleteNoteById = async (id: string): Promise<number> => 
  waitForTask((notes: Note[]) => deleteNoteByIdFn(notes, id));

const insertNote = async (note: NoteInsert): Promise<string> => 
  waitForTask((notes: Note[]) => insertNoteFn(notes, note));

const updateNote = async (note: NoteUpdate): Promise<string | null> => 
  waitForTask((notes: Note[]) => updateNoteFn(notes, note));

export {
  start,
  searchNotes,
  findNoteById,
  deleteNoteById,
  insertNote,
  updateNote,
}
