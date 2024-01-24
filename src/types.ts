// file: src/types.ts
export { makeNoteBrief } from './server/types';
export type { NoteBrief } from './server/types';

export type BriefDateFormat = (
	epochTimestamp: number
) => [display: string, iso: string];
