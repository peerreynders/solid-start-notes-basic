import { Show, Suspense } from 'solid-js';
import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';

import NoteEditor from '~/components/note-editor';
import NoteEditorSkeleton from '~/components/note-editor-skeleton';
import { fetchNote } from '../fetch-note';

import type { RouteDataArgs } from 'solid-start';

export function routeData({ params }: RouteDataArgs ) {
  return createServerData$(
    fetchNote, 
    { key: () => params.id }
  );  
}

export default function NoteEdit() {
  const note = useRouteData<typeof routeData>();

  return (
    <Suspense fallback={ <NoteEditorSkeleton /> }>
    <Show when={ note() } keyed>
      {(note) => (
        <NoteEditor 
          id={ note.id } 
	  initialTitle={ note.title }
	  initialBody={ note.body } 
        />
      )}
    </Show>
    </Suspense>
  );
}
