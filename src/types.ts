// file: src/types.ts
export type { Note, NoteBrief } from './server/types';

const editIntent = ['insert', 'update', 'delete'] as const;
export type EditIntent = (typeof editIntent)[number];

const isEditIntent = (intent: string): intent is EditIntent =>
	(editIntent as ReadonlyArray<string>).includes(intent);

export { isEditIntent };
