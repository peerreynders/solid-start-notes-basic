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
    // run whenever notes updates
    const result = notes();
    if (!result) return '';

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
        when={ (notes()?.length ?? 0) > 0 }
        fallback={
          <div class="note-list__empty">
	    { handle.searchValue().searchText 
	      ? `Couldn't find any notes titled "${ handle.searchValue().searchText }".`
	      : 'No notes created yet!' }{' '}
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
