import { createEffect, Show, Suspense } from 'solid-js';
import { createServerData$ } from 'solid-start/server';
import { useNavigate, useRouteData } from 'solid-start';

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

export default function NoteLayout() {
  const note = useRouteData<typeof routeData>();

  // Navigate home if not found
  const navigate = useNavigate();
  createEffect(() => {
    if (note() === null) navigate(homeHref, { replace: true });
  });

  const updatedAt = () => {
    const current = note();
    if (!current) return '';

    const date = new Date(current.updatedAt);
    return formatDateTime(date);
  };

  const { postRedirect: handle } = useNoteList();
  handle.complete();

  return (
    <Suspense>
      <Show when={ note.state === 'ready' } fallback={ <NoteEditorSkeleton /> }>
        <div class="note">
	  <header class="note__header">
	    <h1 class="note__title">{ note()!.title }</h1>
	    <div class="note__menu" role="menubar">
	      <small class="note__updated-at" role="status">
	        Last updated on { updatedAt() }
	      </small>
	      <EditButton kind="edit" href={ noteEditHrefMaybe(note()!.id) }>Edit</EditButton>
	    </div>
	  </header>
          <NotePreview body={ note()!.body }/>
	</div>
      </Show>
    </Suspense>
  );
}
