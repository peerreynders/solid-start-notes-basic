// file: src/types.ts
export type { Note, NoteBrief } from './types-note.ts';

const EDIT = {
	new: 'new',
	update: 'update',
	delete: 'delete',
} as const;

export type EditIntent = (typeof EDIT)[keyof typeof EDIT];
export type LastEdit =
	| [typeof EDIT.new]
	| [typeof EDIT.update, string]
	| [typeof EDIT.delete, string];

const EDIT_INTENT = Object.values(EDIT);
const isEditIntent = (intent: string): intent is EditIntent =>
	(EDIT_INTENT as Array<string>).includes(intent);

function toLastEdit(intent: EditIntent, id: string | undefined): LastEdit {
	switch (intent) {
		case 'new': {
			return [intent];
		}

		default: {
			if (!id) throw Error(`Missing Note ID for \`${intent}\` LastEdit`);
			return [intent, id];
		}
	}
}

export { isEditIntent, toLastEdit };
