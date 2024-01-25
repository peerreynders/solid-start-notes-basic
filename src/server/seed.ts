// file: src/server/seed.ts
import { Observable, operate } from 'rxjs';
import { makeNoteStore } from './types';
import { excerpt } from './excerpt';

import type { Observer, Subscriber } from 'rxjs';
import type { Content, NoteStore, Note, NoteTransform } from './types';

const content: Content = [
	['Meeting Notes', 'This is an example note. It contains **Markdown**!'],
	[
		'Make a thing',
		`It's very easy to make some words **bold** and other words *italic* with
Markdown. You can even [link to SolidStart's website!](https://start.solidjs.com/).`,
	],
	[
		'A note with a very long title because sometimes you need more words',
		`You can write all kinds of [amazing](https://en.wikipedia.org/wiki/The_Amazing)
notes in this app! These notes live on the server in the \`.data/notes\` file.
![This app is powered by SolidStart](https://assets.solidjs.com/banner?project=Start&amp;type=core)`,
	],
	['I wrote this note today', 'It was an excellent note.'],
];

function makeEpochMsBetween(size: number, low: number, high: number) {
	const [start, end] = low < high ? [low, high] : [high, low];
	const interval = end - start;
	const interpolate = (value: number) =>
		start + Math.floor((interval * value) / 0xffff_ffff);
	const values = new Uint32Array(size);
	crypto.getRandomValues(values);
	values.sort();
	return Array.prototype.map.call<
		Uint32Array,
		[(v: number) => number],
		number[]
	>(values, interpolate);
}

function startOfYear(timestamp: number) {
	const date = new Date(timestamp);
	return new Date(date.getFullYear(), 0, 1).getTime();
}

function makeFromSeed(transform: NoteTransform) {
	const source = new Observable((observer: Observer<Note[]>) => {
		let lastError: Error | undefined;
		const notes: Note[] = [];
		const now = Date.now();
		const created = makeEpochMsBetween(content.length, startOfYear(now), now);

		const error = <T extends Error>(err: T) => {
			if (lastError) return;

			lastError = err;
			observer.error(lastError);
		};

		const next = (note: Note) => {
			if (lastError || notes.length >= content.length) return;

			notes.push(note);
			if (notes.length < content.length) return;

			// Now that all content has been transformed to Notes—ship it!
			// NEXT/COMPLETE: Notes complete finish processing
			observer.next(notes);
			observer?.complete();
		};

		// Note: synchronous firehose
		for (let i = 0; i < content.length; i += 1)
			transform(
				content[i],
				excerpt(content[i][1]),
				created[i],
				now,
				next,
				error
			);

		observer.next(notes);
		observer?.complete();
	});

	const fromSeed = new Observable((destination: Subscriber<NoteStore>) => {
		// decouple destination from synchronous firehose
		source.subscribe(
			operate<Note[], NoteStore>({
				destination,
				next: (notes) => void destination.next(makeNoteStore(notes)),
				complete: () => void destination.complete(),
			})
		);
	});

	return fromSeed;
}

export { makeFromSeed };
