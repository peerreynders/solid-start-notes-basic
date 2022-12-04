import { createEffect, Show, Suspense } from 'solid-js';
import { createServerData$ } from 'solid-start/server';
import { useNavigate, useRouteData } from 'solid-start';

import { Note } from '~/types'
import { homeHref, noteEditHrefMaybe } from '~/route-path';
import { useNoteList } from '~/components/note-list-context';
import EditButton from '~/components/edit-button';
import NoteEditorSkeleton from '~/components/note-editor-skeleton';
import NotePreview from '~/components/note-preview';
import { formatDateTime } from '~/lib/helpers';
import { fetchNote } from './fetch-note';

import type { RouteDataArgs } from 'solid-start';

export function routeData({ params }: RouteDataArgs ) {
  return createServerData$(
    fetchNote, 
    { key: () => params.id }
  );  
}

function formatUpdatedAt(note: Note) {
  if (!note) return '';

  const date = new Date(note.updatedAt);
  return formatDateTime(date);
}

export default function NoteLayout() {
  const note = useRouteData<typeof routeData>();

  // Navigate home if not found
  const navigate = useNavigate();
  createEffect(() => {
    if (note.state !== 'ready') return;

    if (note() === null) navigate(homeHref, { replace: true });
  });

  const { postRedirect: handle } = useNoteList();
  handle.complete();

  return (
    <Suspense fallback={ <NoteEditorSkeleton /> } >
      <Show when={ note() } keyed>
        {(note) => (
          <div class="note">
	    <header class="note__header">
	      <h1 class="note__title">{ note.title }</h1>
	      <div class="note__menu" role="menubar">
	        <small class="note__updated-at" role="status">
	          Last updated on { formatUpdatedAt(note) }
	        </small>
	        <EditButton 
	          kind="edit" 
		  href={ noteEditHrefMaybe(note.id) }
	        >
	          Edit
	        </EditButton>
	      </div>
	    </header>
            <NotePreview body={ note.body }/>
          </div>
	)}
      </Show>
    </Suspense>
  );
}
