// file: src/components/note-edit.tsx
import { createSignal, Show } from 'solid-js';
import { useLocation } from '@solidjs/router';
import NotePreview from './note-preview';
import { useSendLastEdit } from './app-context';
import { editAction } from '../api';
import { toRootpath } from '../route-path';

import type { EditIntent } from '../types';

type Props = {
	noteId: string | undefined;
	initialTitle: string;
	initialBody: string;
};

const maybeNoteId = (maybe: string | undefined) =>
	typeof maybe === 'string' && maybe.length > 0 ? maybe : undefined;

export default function NoteEdit(props: Props) {
	const isUpdate = () => Boolean(maybeNoteId(props.noteId));
	const [intent, _setIntent] = createSignal<EditIntent>(
		isUpdate() ? 'update' : 'insert'
	);
	const [busy, setBusy] = createSignal(false);

	const [title, setTitle] = createSignal(props.initialTitle);
	const titleListener = (
		e: InputEvent & {
			currentTarget: HTMLInputElement;
			target: HTMLInputElement;
		}
	) => {
		e.stopPropagation();
		setTitle(e.currentTarget.value);
	};

	const [body, setBody] = createSignal(props.initialBody);
	const bodyListener = (
		e: InputEvent & {
			currentTarget: HTMLTextAreaElement;
			target: HTMLTextAreaElement;
		}
	) => {
		e.stopPropagation();
		setBody(e.currentTarget.value);
	};

	const location = useLocation();
	const { sendLastEdit } = useSendLastEdit();
	let noteForm: HTMLFormElement | undefined;
	const saveNote = (
		e: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }
	) => {
		if (!noteForm) return;

		setBusy(true);
		e.stopPropagation();
		const id = maybeNoteId(props.noteId);
		sendLastEdit(id ? ['update', id] : ['new']);

		noteForm.requestSubmit();
	};

	return (
		<div class="c-note-edit">
			<form
				ref={noteForm}
				class="c-note-edit__form"
				method="post"
				action={editAction}
			>
				<input type="hidden" name="id" value={props.noteId ?? ''} />
				<input type="hidden" name="from" value={toRootpath(location)} />
				<input type="hidden" name="intent" value={intent()} />
				<label class="u-offscreen" for="note-edit__title">
					Enter a title for your note
				</label>
				<input
					id="note-edit__title"
					type="text"
					name="title"
					value={title()}
					onInput={titleListener}
				/>
				<label class="u-offscreen" for="note-edit__body">
					Enter the body for your note
				</label>
				<textarea
					id="note-edit__body"
					name="body"
					value={body()}
					onInput={bodyListener}
				/>
			</form>
			<div class="c-note-edit__preview">
				<div class="c-note-edit__menu" role="menubar">
					<button
						class="c-note-edit__done"
						role="menuitem"
						disabled={busy()}
						onClick={saveNote}
					>
						<img
							src="/checkmark.svg"
							width="14px"
							height="10px"
							alt=""
							role="presentation"
						/>
						Done
					</button>
					<Show when={isUpdate()}>
						<button
							class="c-note-edit__delete"
							role="menuitem"
							disabled={busy()}
						>
							<img
								src="/cross.svg"
								width="10px"
								height="10px"
								alt=""
								role="presentation"
							/>
							Delete
						</button>
					</Show>
				</div>
				<div class="c-note-edit__label-preview" role="status">
					Preview
				</div>
				<h1 class="c-note-edit__note-title">{title()}</h1>
				<NotePreview body={body()} />
			</div>
		</div>
	);
}
