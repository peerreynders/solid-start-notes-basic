import { APIEvent, json } from 'solid-start/api';
import { searchNotes } from '~/server/notes-db';
import { excerpt } from '~/server/excerpt';
import { NoteView } from '~/types';

const addSummary = (collect: NoteView[], note: Partial<NoteView>) => {
  note.summary =  note.body ? excerpt(note.body) : '';

  collect.push(note as NoteView);
  return collect;
}

function extractSearchText(href: string) {
  const url = new URL(href);
  const search = url.searchParams.get('search');
  return typeof search === 'string' ? search.trim() : '';
}

export async function GET(event: APIEvent) {
  const searchText = extractSearchText(event.request.url); 
  const selected = await searchNotes(searchText);

  return json(selected.reduce(addSummary, []));
}

