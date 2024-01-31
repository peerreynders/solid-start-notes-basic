// file: src/routes/note.tsx
import { Show, Suspense } from 'solid-js';
import { NoHydration } from 'solid-js/web';
import { createAsync, useNavigate } from '@solidjs/router';
import { Title } from '@solidjs/meta';
import { makeTitle } from '../route-path';
import { getNote } from '../api';
import { makeTransformOrNavigate } from './note-common';
import {
	NoteSkeletonDisplay,
	NoteSkeletonEdit,
} from '../components/note-skeleton';
import NoteEdit from '../components/note-edit';
import EditButton from '../components/edit-button';
import NotePreview from '../components/note-preview';

import type { RouteSectionProps } from '@solidjs/router';

type NoteExpanded = ReturnType<ReturnType<typeof makeTransformOrNavigate>>;

function NoteDisplay(props: { note: NoteExpanded }) {
	return (
		<Suspense fallback={<NoteSkeletonDisplay />}>
			<Show when={props.note}>
				{(note) => (
					<>
						<Title>{makeTitle(note().id)}</Title>
						<div class="c-note">
							<div class="c-note__header">
								<h1>{note().title}</h1>
								<div class="c-note__menu" role="menubar">
									<small class="c-note__updated" role="status">
										Last updated on{' '}
										<NoHydration>
											<time dateTime={note().updatedISO}>{note().updated}</time>
										</NoHydration>
									</small>
									<EditButton kind={'edit'}>Edit</EditButton>
								</div>
							</div>
							<NotePreview body={note().body} />
						</div>
					</>
				)}
			</Show>
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
			<Show when={isEdit()} fallback={<NoteDisplay note={note()} />}>
				<Suspense fallback={<NoteSkeletonEdit />}>
					<Show when={note()}>
						{(note) => (
							<NoteEdit
								noteId={note().id}
								initialTitle={note().title}
								initialBody={note().body}
							/>
						)}
					</Show>
				</Suspense>
			</Show>
		</>
	);
}
