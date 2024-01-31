// file: src/types.ts
export type { Note, NoteBrief } from './server/types';

export type BriefDateFormat = (
	epochTimestamp: number
) => [display: string, iso: string];

const editIntent = ['insert', 'update', 'delete'] as const;
export type EditIntent = (typeof editIntent)[number];

const isEditIntent = (intent: string): intent is EditIntent =>
	(editIntent as ReadonlyArray<string>).includes(intent);

export { isEditIntent };
