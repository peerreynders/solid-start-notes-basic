import { useNoteList } from '~/components/note-list-context';

export default function NoteEmpty() {
  const { postRedirect: handle } = useNoteList();
  handle.complete();

  return (
    <div class="note-empty">
       <span class="note-empty__text">
         Click a note on the left to view something! 🥺
       </span>
    </div> 
  );
}
