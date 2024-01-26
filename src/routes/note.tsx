// file: src/routes/note.tsx
import { Show } from 'solid-js';
import { isServer, NoHydration } from 'solid-js/web';
import { Title } from '@solidjs/meta';
import {
	createAsync,
	useLocation,
	useNavigate,
	useParams,
} from '@solidjs/router';
import { hrefToHome, makeTitle } from '../route-path';
import { makeNoteDateFormat } from '../lib/date-time';
import { getNote } from '../api';
import EditButton from '../components/edit-button';

import type { Note } from '../types';

export default function Note() {
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

	const params = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const navigateOnNotFound = (maybeNote: Note | undefined) => {
		if (maybeNote) return toNoteExpanded(maybeNote);

		navigate(hrefToHome(location), { replace: true });
	};
	const note = createAsync(
		() => getNote(params.noteId).then(navigateOnNotFound),
		{ deferStream: true }
	);

	return (
		<Show when={note()}>
			{(note) => (
				<>
					<Title>{makeTitle()}</Title>
					<div class="c-note">
						<div class="c-note__header">
							<h1 class="c-note__title">{note().title}</h1>
							<div class="c-note__menu" role="menubar">
								<small class="c-note__updated-at" role="status">
									Last updated on{' '}
									<NoHydration>
										<time dateTime={note().updatedISO}>{note().updated}</time>
									</NoHydration>
								</small>
								<EditButton kind={'edit'}>Edit</EditButton>
							</div>
						</div>
						<span>{`Note (id: ${params.noteId})`}</span>
					</div>
				</>
			)}
		</Show>
	);
}
