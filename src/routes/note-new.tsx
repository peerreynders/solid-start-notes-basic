// file: src/routes/note-new.tsx
import { Title } from '@solidjs/meta';
import { makeTitle } from '../route-path';
import NoteEditor from '../components/note-edit';

export default function NoteNew() {
	return (
		<>
			<Title>{makeTitle('New Note')}</Title>
			<NoteEditor
				noteId={undefined}
				initialTitle={'Untitled'}
				initialBody={''}
			/>
		</>
	);
}
