// file: src/api.ts
import { cache } from '@solidjs/router';
import { getBriefs as getBf, getNote as getNt } from './server/api';

import { NoteBrief, Note } from './types';

const getBriefs = cache<
	(search: string | undefined) => Promise<NoteBrief[]>,
	Promise<NoteBrief[]>
>(async (search: string | undefined) => getBf(search), 'briefs');

const getNote = cache<
	(noteId: string) => Promise<Note | undefined>,
	Promise<Note | undefined>
>(async (noteId: string) => getNt(noteId), 'note');

export { getBriefs, getNote };
