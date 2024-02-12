// file: src/routes/note.tsx
import { onMount, Show, Suspense } from 'solid-js';
import { isServer, NoHydration } from 'solid-js/web';
import { createAsync, useNavigate } from '@solidjs/router';
import { Title } from '@solidjs/meta';
import { hrefToHome, makeTitle } from '../route-path';
import { getNote } from '../api';
import { localizeFormat, makeNoteDateFormat } from '../lib/date-time';
import {
	NoteSkeletonDisplay,
	NoteSkeletonEdit,
} from '../components/note-skeleton';
import NoteEdit from '../components/note-edit';
import EditButton from '../components/edit-button';
import NotePreview from '../components/note-preview';

import type { Location, Navigator, RouteSectionProps } from '@solidjs/router';
import type { Note } from '../types';

const noteDateFormat = isServer
	? makeNoteDateFormat()
	: makeNoteDateFormat(Intl.DateTimeFormat().resolvedOptions());

function makeTransformOrNavigate(
	location: Location<unknown>,
	navigate: Navigator
) {
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

type NoteExpanded = ReturnType<ReturnType<typeof makeTransformOrNavigate>>;

function NoteDisplay(props: { noteId: string; note: NoteExpanded }) {
	// `noteId` is available immediately
	// while `note` (containing `id`) needs async to fulfill first
	const ofNote = (
		propName: 'title' | 'body' | 'updated' | 'updatedISO',
		defaultValue = ''
	) => props.note?.[propName] ?? defaultValue;

	let noteUpdated: HTMLElement | undefined;

	onMount(() => {
		// After hydration correct the display date/time
		// if it deviates from the server generated one
		// (a request may carry the locale but not the timezone)
		// Also `ref` doesn't work on elements inside a `NoHydration` boundary
		localizeFormat(noteDateFormat, noteUpdated);
	});

	return (
		<Suspense fallback={<NoteSkeletonDisplay />}>
			<Title>{makeTitle(props.noteId)}</Title>
			<div class="c-note">
				<div class="c-note__header">
					<h1>{ofNote('title')}</h1>
					<div class="c-note__menu" role="menubar">
						<small ref={noteUpdated} class="c-note__updated" role="status">
							Last updated on{' '}
							<NoHydration>
								<time dateTime={ofNote('updatedISO')}>{ofNote('updated')}</time>
							</NoHydration>
						</small>
						<EditButton kind={'edit'}>Edit</EditButton>
					</div>
				</div>
				<NotePreview body={ofNote('body')} />
			</div>
		</Suspense>
	);
}

export type NoteProps = RouteSectionProps & { edit: boolean };

export default function Note(props: NoteProps) {
	const isEdit = () => props.edit;
	const noteId = () => props.params.noteId;
	const navigate = useNavigate();
	const transformOrNavigate = makeTransformOrNavigate(props.location, navigate);
	const note = createAsync(() => getNote(noteId()).then(transformOrNavigate), {
		deferStream: true,
	});
	return (
		<>
			<Title>{makeTitle(isEdit() ? `Edit ${noteId()}` : noteId())}</Title>
			<Show
				when={isEdit()}
				fallback={<NoteDisplay noteId={noteId()} note={note()} />}
			>
				<Suspense fallback={<NoteSkeletonEdit />}>
					<NoteEdit
						noteId={noteId()}
						initialTitle={note()?.title}
						initialBody={note()?.body}
					/>
				</Suspense>
			</Show>
		</>
	);
}
