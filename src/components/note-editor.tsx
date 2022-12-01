import { createSignal, Show, useTransition } from 'solid-js';
import { LastEdit } from '~/types';
import { useNoteList } from './note-list-context';
import NotePreview from './note-preview';

/* --- BEGIN server side --- */
import { createServerAction$, redirect } from 'solid-start/server';
import { noteHref, homeHref } from '~/route-path'; 
import { deleteNoteById, updateNote, insertNote } from '~/server/notes-db';

function fromEntryValue(form: FormData, name: string, defaultValue: string = ''): string {
  const value = form.get(name);
  return (
    typeof value !== 'string' ? 
      defaultValue : 
      value.length < 1 ? 
      defaultValue : 
      value
  );
}

async function updateNoteData(form: FormData) {
   const id = fromEntryValue(form, 'id');
   const title = fromEntryValue(form, 'title');
   const body = fromEntryValue(form, 'body');

   const noteId = await (
     id.length > 0 ? 
       updateNote({ id, title, body }) : 
       insertNote({ title, body })
   );

   const href = noteId ? noteHref(noteId) : homeHref; 
   return redirect(href);
}

async function deleteNoteData(id: string) {
  await deleteNoteById(id);
  return redirect(homeHref);
}
/* --- END server side --- */

type Props = {
  id?: string;
  initialTitle: string;
  initialBody: string;
};

export default function NoteEditor(props: Props) {
  const isUpdate = () => typeof props.id === 'string';

  const [title, setTitle] = createSignal(props.initialTitle);
  const titleListener = (e: InputEvent & { currentTarget: HTMLInputElement, target: Element }) => {
    e.stopPropagation();  
    setTitle(e.currentTarget.value);
  };

  const [body, setBody] = createSignal(props.initialBody);
  const bodyListener = (e: InputEvent & { currentTarget: HTMLTextAreaElement, target: Element }) => {
    e.stopPropagation();  
    setBody(e.currentTarget.value);
  };

  const [isSaving, saveNote] = createServerAction$(updateNoteData);
  const [isDeleting, deleteNote] = createServerAction$(deleteNoteData);
  const [isPending, startTransition] = useTransition();
  const { lastEdit: handle } = useNoteList();

  const startDelete = () => 
    startTransition(
      () => {
        const id = props.id;
	if (!id) return;

        handle.lastEdit(['delete', id]);
        deleteNote(id);
      }
    );
  const forwardSave = () => {
    const edit : LastEdit | undefined = 
      !isUpdate() ? 
        ['new'] : 
	props.id ? 
	  ['update', props.id] : 
	  undefined; 
    if (edit) handle.lastEdit(edit);
  };
  const isBusy = () => isSaving.pending || isDeleting.pending || isPending();

  return (
    <div class="note-editor">
      <saveNote.Form
        id="note-editor"
        class="note-editor__form"
        autocomplete="off"
	onSubmit={ forwardSave }
      >
        <input type="hidden" name="id" value={ props.id ?? '' }/>
	<label class="offscreen" for="note-title-input">
	  Enter a title for your note
	</label>
	<input 
	  id="note-title-input"
	  name="title"
	  type="text"
	  value={ title() }
	  onInput={ titleListener }
	/>
	<label class="offscreen" for="note-body-input">
	  Enter the body for your note
	</label>
	<textarea 
	  id="note-body-input"
	  name="body"
	  value={ body() }
	  onInput={ bodyListener }
	/>
      </saveNote.Form>
      <div class="note-editor__preview">
        <div class="note-editor__menu" role="menubar">
	  <button 
	    class="note-editor__done"
	    form="note-editor"
	    type="submit"
	    disabled={ isBusy() }
	    role="menuitem"
	  >
	    <img src="/checkmark.svg" alt="" role="presentation" />
	    Done
	  </button>
	  <Show when={ isUpdate() } >
	    <button
	      class="note-editor__delete"
	      disabled={ isBusy() }
	      onClick={ startDelete }
	      role="menuitem"
	    >
	      <img src="/cross.svg" alt="" role="presentation" />
	      Delete
	    </button>
	  </Show>
	</div>
        <div class="note-editor__preview-label" role="status">
	  Preview
	</div>
        <h1 class="note-editor__preview-title">{ title() }</h1>
        <NotePreview body={ body() } />
      </div>
    </div>
  );
}
