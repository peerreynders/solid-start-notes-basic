// file: src/routes/note-common.ts
import { isServer } from 'solid-js/web';
import { makeNoteDateFormat } from '../lib/date-time';
import { hrefToHome } from '../route-path';

import type { Location, Navigator } from '@solidjs/router';
import type { Note } from '../types';

function makeTransformOrNavigate(
	location: Location<unknown>,
	navigate: Navigator
) {
	const noteDateFormat = isServer
		? makeNoteDateFormat()
		: makeNoteDateFormat(Intl.DateTimeFormat().resolvedOptions());

	const toNoteExpanded = ({ id, title, body, updatedAt }: Note) => {
		const [updated, updatedISO] = noteDateFormat(updatedAt);
		return {
			id,
			title,
			body,
			updatedAt,
			updatedISO,
			updated,
		};
	};

	return function transformOrNavigate(maybeNote: Note | undefined) {
		if (maybeNote) return toNoteExpanded(maybeNote);

		navigate(hrefToHome(location), { replace: true });
	};
}

export { makeTransformOrNavigate };
