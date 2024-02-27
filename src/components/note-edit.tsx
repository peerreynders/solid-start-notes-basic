// file: src/components/note-edit.tsx
import { createSignal, Show } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { toLastEdit, type EditIntent } from '../types';
import { toRootpath } from '../route-path';
import { editAction } from '../api';
import { useSendLastEdit } from './app-context';
import { NotePreview } from './note-preview';

type Props = {
	noteId: string | undefined;
	initialTitle: string | undefined;
	initialBody: string | undefined;
};

// remove `undefined` from setter argument union type
type UpdatePair<T> = [
	updated: () => T | undefined,
	setter: (updated: Exclude<T, undefined>) => void,
];
type TextUpdate = string | undefined;
type TextUpdatePair = UpdatePair<TextUpdate>;

const maybeNoteId = (maybe: string | undefined) =>
	typeof maybe === 'string' && maybe.length > 0 ? maybe : undefined;

function NoteEdit(props: Props) {
	const isUpdate = () => Boolean(maybeNoteId(props.noteId));
	const [intent, setIntent] = createSignal<EditIntent>(
		isUpdate() ? 'update' : 'new'
	);
	const [busy, setBusy] = createSignal(false);
	const [updatedTitle, setTitle] = createSignal<TextUpdate>(
		undefined
	) as TextUpdatePair;
	const [updatedBody, setBody] = createSignal<TextUpdate>(
		undefined
	) as TextUpdatePair;
	// follow reactive prop while no edit has taken place
	const title = () => updatedTitle() ?? props.initialTitle ?? '';
	const body = () => updatedBody() ?? props.initialBody ?? '';

	const titleListener = (
		e: InputEvent & {
			currentTarget: HTMLInputElement;
			target: HTMLInputElement;
		}
	) => {
		e.stopPropagation();
		setTitle(e.currentTarget.value);
	};

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
	const { sendLastEdit: send } = useSendLastEdit();
	let noteForm: HTMLFormElement | undefined;
	// clear app-context
	send(undefined);

	const saveNote = (
		e: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }
	) => {
		if (!noteForm) return;

		setBusy(true);
		e.stopPropagation();
		// `intent()` informs editAction whether to
		// perform `insert` (new) or `update` (edit)
		//
		// inform the rest of the application
		// of impending `new` or `edit`
		send(toLastEdit(intent(), maybeNoteId(props.noteId)));
		noteForm.requestSubmit();
	};

	const deleteNote = (
		e: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }
	) => {
		const id = maybeNoteId(props.noteId);
		if (!(noteForm && id)) return;

		setBusy(true);
		e.stopPropagation();
		// inform editAction to perform delete
		setIntent('delete');
		// inform the rest of the application
		// of impending delete
		send(toLastEdit(intent(), id));
		// submit editAction
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
							onClick={deleteNote}
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

export { NoteEdit };
