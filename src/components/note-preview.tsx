import TextWithMdClient from './text-with-md-client';

type Props = {
  body: string;
}

export default function NotePreview(props: Props) {
  return (
    <div class="note-preview">
      <TextWithMdClient text={ props.body } />
    </div>
  );
}
