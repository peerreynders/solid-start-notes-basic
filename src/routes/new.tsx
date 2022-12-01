import NoteEditor from "~/components/note-editor";

export default function NoteNew() {
  return (
    <NoteEditor 
      initialTitle="Untitled"
      initialBody="" 
    />
  );
}
