// file: src/server/repo.ts
import { createStorage } from 'unstorage';
import fsLiteDriver from 'unstorage/drivers/fs-lite';
import { Observable, operate, rx } from 'rxjs';
import { nanoid } from 'nanoid';
import { makeFromSeed } from './seed';
import { makeNoteStore } from './types';

import type { MonoTypeOperatorFunction } from 'rxjs';
import type {
	Content,
	NotePersist,
	NotePersistInsert,
	NotePersistUpdate,
	NoteStore,
} from './types';

const storage = createStorage({
	driver: fsLiteDriver({
		base: '.data',
	}),
});

const maybeNotes = () => storage.getItem<NotePersist[]>('notes');

function byModifiedDesc(a: NotePersist, b: NotePersist) {
	const updateDifference = b.updatedAt - a.updatedAt;
	return updateDifference !== 0 ? updateDifference : b.createdAt - a.createdAt;
}

const updateNoteStore = (source: Observable<NoteStore>) =>
	new Observable<NoteStore>((destination) => {
		let storageDone = false;
		const error = (err: Error) => {
			if (storageDone) return;

			storageDone = true;
			destination.error(err);
		};
		let resolved = false;
		let sourceDone = false;
		const complete = () => {
			if (storageDone || !(sourceDone && resolved)) return;

			storageDone = true;
			destination.complete();
		};

		source.subscribe({
			error,
			next: (store) => {
				const sortedStore = makeNoteStore(store.notes.toSorted(byModifiedDesc));
				storage
					.setItem<NotePersist[]>('notes', sortedStore.notes)
					.then(() => {
						destination.next(sortedStore);
						resolved = true;
						complete();
					})
					.catch(error);
			},
			complete: () => {
				sourceDone = true;
				complete();
			},
		});
	});

const makeNote = (
	title: string,
	body: string,
	excerpt: string,
	id: string,
	createdAt: number,
	updatedAt: number
) => ({
	id,
	title,
	body,
	excerpt,
	createdAt,
	updatedAt,
});

function toNoteTransform(
	[title, body]: Content[number],
	excerpt: string,
	createdEpochMs: number,
	updatedEpochMs: number,
	noteCallback: (note: NotePersist) => void,
	_error: (err: Error) => void
) {
	noteCallback(
		makeNote(title, body, excerpt, nanoid(), createdEpochMs, updatedEpochMs)
	);
}

const ensureNotes = (source: Observable<NotePersist[] | null>) =>
	new Observable<NoteStore>((destination) => {
		let done = false;
		const error = (err: Error) => {
			if (done) return;

			done = true;
			destination.error(err);
		};

		let storeComplete = false;
		let sourceComplete = false;
		const complete = () => {
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
				rx(makeFromSeed(toNoteTransform), updateNoteStore).subscribe({
					error,
					next: (store) => {
						if (done) return;

						destination.next(store);
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
	predicate: ((note: NotePersist) => boolean) | undefined;
	resolve: (notes: NotePersist[]) => void;
	reject: (error: Error) => void;
};

type FindNoteTask = {
	kind: 1;
	predicate: (note: NotePersist) => boolean;
	resolve: (notes: NotePersist | undefined) => void;
	reject: (error: Error) => void;
};

function runSelectNotes(
	task: FilterNotesTask | FindNoteTask,
	done: () => void
) {
	let taskDone = false;
	let sourceComplete = false;
	let resolved = false;
	const complete = () => {
		if (taskDone || !(sourceComplete && resolved)) return;

		taskDone = true;
		done();
	};

	rx(maybeNotes(), ensureNotes).subscribe({
		error: (err: Error) => {
			if (taskDone) return;

			taskDone = true;
			task.reject(err);
			done();
		},
		next: (store: NoteStore) => {
			if (taskDone) return;

			if (task.kind === 0) {
				const result = task.predicate
					? store.notes.filter(task.predicate)
					: store.notes;
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
	update: (notes: NotePersist[]) => [NotePersist[], NotePersist | undefined];
	resolve: (result: NotePersist | undefined) => void;
	reject: (error: Error) => void;
};

function runUpdateNotes(task: UpdateNoteTask, done: () => void) {
	let taskDone = false;
	const error = (err: Error) => {
		if (taskDone) return;

		taskDone = true;
		task.reject(err);
		done();
	};

	let sourceComplete = false;
	let resolved = false;
	const complete = () => {
		if (taskDone || !(sourceComplete && resolved)) return;

		taskDone = true;
		done();
	};

	let updatedNote: NotePersist | undefined;

	// stage to update the notes content
	const updateNotes: MonoTypeOperatorFunction<NoteStore> = (
		source: Observable<NoteStore>
	) =>
		new Observable<NoteStore>((destination) => {
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

						const [notes, updated] = task.update(store.notes);
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
		});

	rx(maybeNotes(), ensureNotes, updateNotes, updateNoteStore).subscribe({
		error,
		next: (_store) => {
			if (taskDone) return;

			resolved = true;
			task.resolve(updatedNote);
			complete();
		},
		complete: () => {
			sourceComplete = true;
			complete();
		},
	});
}

type Task = FilterNotesTask | FindNoteTask | UpdateNoteTask;

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
		case 1: {
			runSelectNotes(task, runTasks);
			return;
		}

		case 2: {
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
	return (note: NotePersist) => note.title.toLowerCase().includes(text);
}

function selectNotesInTitle(withText?: string) {
	const predicate = makeTitleWithText(withText);
	return new Promise<NotePersist[]>((resolve, reject) => {
		queueTask({ kind: 0, predicate, resolve, reject });
	});
}

function selectNote(id: NotePersist['id']) {
	const predicate = (note: NotePersist) => note.id === id;
	return new Promise<NotePersist | undefined>((resolve, reject) => {
		queueTask({ kind: 1, predicate, resolve, reject });
	});
}

const makeInsertNote =
	(note: NotePersistInsert) =>
	(current: NotePersist[]): [NotePersist[], NotePersist] => {
		const createdAt = Date.now();
		const newNote = makeNote(
			note.title,
			note.body,
			note.excerpt,
			nanoid(),
			createdAt,
			createdAt
		);
		return [current.toSpliced(current.length, 0, newNote), newNote];
	};

function insertNote(note: NotePersistInsert) {
	return new Promise<NotePersist | undefined>((resolve, reject) => {
		queueTask({ kind: 2, update: makeInsertNote(note), resolve, reject });
	});
}

const makeUpdateNote =
	(update: NotePersistUpdate) =>
	(current: NotePersist[]): [NotePersist[], NotePersist | undefined] => {
		const index = current.findIndex((note) => note.id === update.id);
		if (index < 0) return [current, undefined];

		const note = current[index];
		const updated = makeNote(
			update.title,
			update.body,
			update.excerpt,
			note.id,
			note.createdAt,
			Date.now()
		);
		return [current.toSpliced(index, 1, updated), updated];
	};

function updateNote(note: NotePersistUpdate) {
	return new Promise<NotePersist | undefined>((resolve, reject) => {
		queueTask({ kind: 2, update: makeUpdateNote(note), resolve, reject });
	});
}

const makeDeleteNote =
	(id: NotePersist['id']) =>
	(current: NotePersist[]): [NotePersist[], NotePersist | undefined] => {
		const index = current.findIndex((note) => note.id === id);
		return index > -1
			? [current.toSpliced(index, 1), current[index]]
			: [current, undefined];
	};

function deleteNote(id: NotePersist['id']) {
	return new Promise<NotePersist | undefined>((resolve, reject) => {
		queueTask({ kind: 2, update: makeDeleteNote(id), resolve, reject });
	});
}

export { deleteNote, insertNote, selectNotesInTitle, selectNote, updateNote };
