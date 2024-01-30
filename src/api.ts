// file: src/api.ts
import { action, cache, redirect } from '@solidjs/router';
import {
	searchFromRootpath,
	searchParamFromSearch,
	rootpathToHome,
	rootpathWithNote,
} from './route-path';
import {
	getBriefs as getBf,
	getNote as getNt,
	upsertNote as upsertNt,
} from './server/api';
import { isEditIntent } from './types';

import type { NoteBrief, Note } from './types';

const getBriefs = cache<
	(search: string | undefined) => Promise<NoteBrief[]>,
	Promise<NoteBrief[]>
>(async (search: string | undefined) => getBf(search), 'briefs');

const getNote = cache<
	(noteId: string) => Promise<Note | undefined>,
	Promise<Note | undefined>
>(async (noteId: string) => getNt(noteId), 'note');

const editAction = action(async (data: FormData) => {
	const intent = data.get('intent');
	if (typeof intent !== 'string' || !isEditIntent(intent))
		throw new Error(`Malformed edit-action. "intent" param: :${intent}`);

	const from = data.get('from');
	if (typeof from !== 'string' || from.length < 1)
		throw new Error(`Malformed edit-action. "from" param: :${from}`);
	const search = searchFromRootpath(from);
	const searchParam = searchParamFromSearch(search);

	const noteId = data.get('id') ?? '';
	const title = data.get('title') ?? '';
	const body = data.get('body') ?? '';
	if (
		typeof noteId !== 'string' ||
		typeof title !== 'string' ||
		typeof body !== 'string'
	)
		throw new Error('Malformed edit-action. note params');

	const id = noteId.length > 0 ? noteId : undefined;
	if (intent === 'insert' || intent === 'update') {
		const note = await upsertNt(title, body, id);
		// - navigate to `/notes/:id` if note was returned
		// - otherwise `/`
		// - naturally title or body of the note could have changed
		//   making it necessary to load it
		// - But the title (or excerpt) could also have changed
		//   which could impact the briefs search result even if the
		//   search parameter itself hasn't changed.
		const [path, revalidate] = note
			? [
					rootpathWithNote(note.id, search),
					[getBriefs.keyFor(searchParam), getNote.keyFor(note.id)],
				]
			: [rootpathToHome(search), getBriefs.keyFor(searchParam)];

		throw redirect(path, { revalidate });
	}
}, 'edit-action');

export { getBriefs, getNote, editAction };
