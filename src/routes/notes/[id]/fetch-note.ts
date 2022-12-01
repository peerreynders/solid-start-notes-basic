import { findNoteById } from '~/server/notes-db';

import type { Note } from '~/types';

export async function fetchNote(id: string): Promise<Note | null> {
  return findNoteById(id);
}
