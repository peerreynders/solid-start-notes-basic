// file: src/server/repo.ts
import { createStorage } from 'unstorage';
import fsLiteDriver from 'unstorage/drivers/fs-lite';
import { Observable, operate, rx } from 'rxjs';
import { nanoid } from 'nanoid'; 
import { makeFromSeed } from './seed';
import { makeNoteStore } from './types';

import type { MonoTypeOperatorFunction } from 'rxjs';
import type { Content, Note, NoteInsert, NoteStore } from './types';

const storage = createStorage({
	driver: fsLiteDriver({
		base: '.data',
	}),
});

const maybeNotes = () => storage.getItem<Note[]>('notes');

function byModifiedDesc(a: Note, b: Note) {
	const updateDifference = b.updatedAt - a.updatedAt;
	return updateDifference !== 0 ? updateDifference : b.createdAt - a.createdAt;
}

const updateNoteStore = (source: Observable<NoteStore>) => 
	new Observable<NoteStore>((destination) => {
		source.subscribe({
			error: (err) => destination.error(err),
			next: (store) => {
				const sortedStore = makeNoteStore(store.notes.toSorted(byModifiedDesc)) ;

				storage.setItem<Note[]>('notes', sortedStore.notes)
				.then(() => destination.next(sortedStore))
				.catch((err) => destination.error(err));
			},
			complete: () => destination.complete(),
		})
	});

const makeNote = (
	title: string, 
	body: string, 
	id: string, 
	createdAt: number, 
	updatedAt: number
) => ({
	id,
	title,
  body,
  createdAt,
  updatedAt,
});

function toNoteTransform(
	[title, body]: Content[number],
	createdEpochMs: number, 
	updatedEpochMs: number,
	noteCallback: (note: Note) => void,
	_error: (err: Error) => void 
) {
  noteCallback(
		makeNote(
			title, 
			body, 
			nanoid(), 
			createdEpochMs, 
			updatedEpochMs
		)
	);
}

const ensureNotes = (source: Observable<Note[] | null>) => 
	new Observable<NoteStore>((destination) => {
		let done = false;
		const error = (err: Error) =>{
			if (done) return;

			done = true;
			destination.error(err);
		};

		let storeComplete = false;
		let sourceComplete = false;
		const	complete = () => { 
			if (done || !(sourceComplete && storeComplete)) return;

			done = true;
			destination.complete();
		};
		const sentStore = () => {
			storeComplete = true;
			complete();
		};

		source.subscribe({
			error,
			next: (notes) => {
				if (done) return;

				if (notes) {
					// storage already loaded
					destination.next(makeNoteStore(notes));
					sentStore();
					return;
				}

				// initialize storage
				rx(
					makeFromSeed(toNoteTransform),
					updateNoteStore,
				).subscribe({
					error,
					next: (store) => {
						if (done) return;

						destination.next(store)
					},
					complete: sentStore,
				});
			},
			complete: () => {
				sourceComplete = true;
				complete();
			},
		});
	});

type FilterNotesTask = {
	kind: 0;
	predicate: ((note: Note) => boolean) | undefined;
	resolve: (notes: Note[]) => void;
	reject: (error: Error) => void;
};

type FindNoteTask = {
	kind: 1;
	predicate: (note: Note) => boolean;
	resolve: (notes: Note | undefined) => void;
	reject: (error: Error) => void;
};

function runSelectNotes(
	task: FilterNotesTask | FindNoteTask, 
	done: () => void
) {
	let taskDone = false;
	let sourceComplete = false;
	let resolved = false;
	const	complete = () => { 
		if (taskDone || !(sourceComplete && resolved)) return;

		taskDone = true;
		done();
	};

	rx(
		maybeNotes(),
		ensureNotes,
	).subscribe({
		error: (err: Error) => {
			if (taskDone) return;

			taskDone = true;
			task.reject(err);
			done();
		},
		next: (store: NoteStore) => {
			if (taskDone) return;

			if (task.kind === 0) {
				const result = task.predicate ? store.notes.filter(task.predicate) : store.notes;
				task.resolve(result);
			} else {
				task.resolve(store.notes.find(task.predicate));
			}
			resolved = true;
			complete();
		},
		complete: () => {
			if (taskDone) return;

			sourceComplete = true;
			complete();
		},
	});
}

type UpdateNoteTask = {
	kind: 2;
	update: (notes: Note[]) => [Note[], Note];
	resolve: (result: Note) => void;
	reject: (error: Error) => void;
};

type UpdateAllTask = {
	kind: 3;
	update: (notes: Note[]) => Note[];
	resolve: (result: Note[]) => void;
	reject: (error: Error) => void;
};

function runUpdateNotes(task: UpdateNoteTask | UpdateAllTask, done: () => void) {
	let taskDone = false;	
	const	error = (err: Error) => {
		if (taskDone) return;

		taskDone = true;
		task.reject(err);
		done();
	};

	let sourceComplete = false;
	let resolved = false;
	const	complete = () => { 
		if (taskDone || !(sourceComplete && resolved)) return;

		taskDone = true;
		done();
	};

	let updatedNote: Note | undefined;

	// stage to update the notes content
	const updateNotes: MonoTypeOperatorFunction<NoteStore> = 
		(source: Observable<NoteStore>) => new Observable<NoteStore>(
			(destination) => {
				let updateDone = false;
				const error = (err: Error) => {
					if (updateDone) return;

					updateDone = true;
					destination.error(err);
				};

				let sourceComplete = false;
				let storeComplete = false;
				const complete = () => {
					if (updateDone || !(sourceComplete && storeComplete)) return;

					updateDone = true;
					destination.complete();
				};

				source.subscribe(
					operate({
						destination,
						error,
						next: (store) => {
							if (updateDone) return;

							const [notes, updated] = 
								task.kind === 2 ?
									task.update(store.notes) :
									[task.update(store.notes), undefined];
							updatedNote = updated;
						
							storeComplete = true;
							destination.next(makeNoteStore(notes));
							complete();
						},
						complete: () => {
							sourceComplete = true;
							complete();
						},
					})
				);
			}
		);

	rx(
		maybeNotes(),
		ensureNotes,
		updateNotes,
		updateNoteStore
	).subscribe({
		error,
		next: (store) => {
			if (task.kind === 2) {
				// UpdateNoteTask
				if (!updatedNote) {
					error(new Error('updatedNote not set'));
					return;
				}

				resolved = true;
				task.resolve(updatedNote);

			} else {
				// UpdateAllTask
				resolved = true;
				task.resolve(store.notes);
			}
			complete();
		},
		complete: () => {
			sourceComplete = true;
			complete();
		}
	});
}

type Task = FilterNotesTask | FindNoteTask | UpdateAllTask | UpdateNoteTask;

let scheduled = false;
let currentIndex = -1;
const tasks: Task[] = [];

function runTasks() {
	currentIndex += 1;

	if (currentIndex >= tasks.length) {
		// No more tasks
		tasks.length = 0;
		currentIndex = -1;
		scheduled = false;
		return;
	}

	const task = tasks[currentIndex];
	switch (task.kind) {
		case 0:
		case 1:
			{
			runSelectNotes(task, runTasks);
			return;
		}
		case 2:
		case 3: {
			runUpdateNotes(task, runTasks);
			return;
		}
	}
}

function queueTask(task: Task) {
	tasks.push(task);
	if (scheduled) return;

	scheduled = true;
	queueMicrotask(runTasks);
}

function makeTitleWithText(withText?: string) {
	if (!withText) return undefined;

	const text = withText.toLowerCase();
	return (note: Note) => note.title.toLowerCase().includes(text);
}

function selectNotesInTitle(withText?: string) {
	const predicate = makeTitleWithText(withText);
	return new Promise<Note[]>((resolve, reject) => {
		queueTask({ kind: 0, predicate, resolve, reject });
	});
}

function selectNoteWithId(id: string) {
	const predicate = (note: Note) => note.id === id;
	return new Promise<Note | undefined>((resolve, reject) => {
		queueTask({ kind: 1, predicate, resolve, reject });
	});
}

function insertNote(note: NoteInsert) {
	const update = (current: Note[]): [Note[], Note] => {
		const createdAt = Date.now();
		const newNote = makeNote(
			note.title,
			note.body,
			nanoid(),
			createdAt,
			createdAt,
		);

		return [current.toSpliced(current.length, 0, newNote), newNote];
	};

	return new Promise<Note | undefined>((resolve, reject) => {
		queueTask({ kind: 2, update, resolve, reject });
	});
}

export { insertNote, selectNotesInTitle, selectNoteWithId };
