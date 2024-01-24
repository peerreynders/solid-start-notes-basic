// file: src/api.ts
import { cache } from '@solidjs/router';
import { getBriefs as getBf } from './server/api';

import { NoteBrief } from './types';

const getBriefs = cache<
	(search: string | undefined) => Promise<NoteBrief[]>,
	Promise<NoteBrief[]>
>(async (search: string | undefined) => getBf(search), 'briefs');

export { getBriefs };
