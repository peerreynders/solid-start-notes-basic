// file: src/types.ts
export type { Note, NoteBrief } from './server/types';

export type BriefDateFormat = (
	epochTimestamp: number
) => [display: string, iso: string];
