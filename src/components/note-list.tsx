import { createMemo, createResource, For, Show, Suspense, untrack } from 'solid-js';
import { useLocation } from 'solid-start';

import { notesSearchHref, extractNoteId } from '~/route-path';
import { useNoteList } from '~/components/note-list-context';

import NoteListSkeleton from './note-list-skeleton';
import SidebarNote from './sidebar-note';

import type { NoteView } from '~/types';
import type { SearchValue } from '~/components/note-list-context';

async function fetchNotes({ searchText }: SearchValue ): Promise<NoteView[]> {
  const href = notesSearchHref(searchText);
  const result = await (await fetch(href)).json();
  return result;
}

function notesFound(notes: NoteView[] | undefined): boolean {
  if (typeof notes === 'undefined') return false;

  return notes.length > 0;
}

const notFoundMessage = (searchText: string) => 
  searchText ?
    `Couldn't find any notes titled "${ searchText }".` :
    'No notes created yet!';

export default function NoteList() {
  const { fetch: handle } = useNoteList();
  const [notes] = createResource(handle.searchValue, fetchNotes);

  // Let SearchField know when notes are loading
  handle.holder({ 
    loading: () => notes.loading 
  });

  // Determine which note was JUST 
  // created/saved if any.
  //
  const location = useLocation();
  const pathId = () => extractNoteId(location.pathname);
  const lastEditId = createMemo(() => {
    const NO_LAST_ID = '';
    // Don't get last ID until fully loaded
    if (notes.state !== 'ready') return NO_LAST_ID;

    const edit = handle.popLastEdit();
    if (typeof edit === 'undefined') return NO_LAST_ID;

    const [kind, noteId] = edit;
    return  kind === 'update' ? 
      noteId : 
      kind === 'new' ? 
      untrack(pathId) : 
      NO_LAST_ID;
  });

  return (
    <Suspense fallback={ <NoteListSkeleton /> }>
      <Show
        when={ notesFound(notes()) }
        fallback={
          <div class="note-list__empty">
	    { notFoundMessage(handle.searchValue().searchText) }{' '}
	  </div>
        }
      >
        <ul class="note-list">
          <For each={ notes() }>
	    { note => (
	      <li> 
	        <SidebarNote
		  note={ note } 
		  recentEdit={ lastEditId() === note.id }
		/> 
	      </li>
	    )}
	  </For>
        </ul>
      </Show>
    </Suspense>
  );
}
