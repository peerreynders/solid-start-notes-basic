// file: src/api.ts
import { action, cache, redirect, revalidate } from '@solidjs/router';
import {
	searchFromRootpath,
	rootpathToHome,
	rootpathWithNote,
} from './route-path';
import {
	deleteNote as deleteNt,
	getBriefs as getBf,
	getNote as getNt,
	upsertNote as upsertNt,
} from './server/api';
import { isEditIntent } from './types';

import type { NoteBrief, Note } from './types';

const NAME_EDIT_ACTION = 'edit-action';
const NAME_GET_BRIEFS = 'briefs';
const NAME_GET_NOTE = 'note';

const getBriefs = cache<(search: string | undefined) => Promise<NoteBrief[]>>(
	async (search: string | undefined) => getBf(search),
	NAME_GET_BRIEFS
);

const getNote = cache<(noteId: string) => Promise<Note | undefined>>(
	async (noteId: string) => getNt(noteId),
	NAME_GET_NOTE
);

const editAction = action(async (data: FormData) => {
	const intent = data.get('intent');
	if (typeof intent !== 'string' || !isEditIntent(intent))
		throw new Error(`Malformed edit-action. "intent" param: :${intent}`);

	const from = data.get('from');
	if (typeof from !== 'string' || from.length < 1)
		throw new Error(`Malformed edit-action. "from" param: :${from}`);
	const search = searchFromRootpath(from);

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
		// navigate to `/notes/:id` if note was returned
		// otherwise navigate to `/`
		const path = note
			? rootpathWithNote(note.id, search)
			: rootpathToHome(search);

		// - A new note may now need to appear in the briefs
		// - An existing note's title (or excerpt) could have changed
		// i.e.  briefs need to be reloaded even if the
		// search param didn't change
		revalidate(NAME_GET_BRIEFS, true);

		throw redirect(path);
	}

	if (intent === 'delete') {
		if (!id) throw new Error('edit-action: cannot delete without ID');

		await deleteNt(id);
		// - after delete note may need to be removed from briefs (i.e. revalidate)
		revalidate(NAME_GET_BRIEFS, true);
		// - navigate to the home page
		throw redirect(rootpathToHome(search));
	}
}, NAME_EDIT_ACTION);

export { getBriefs, getNote, editAction };
