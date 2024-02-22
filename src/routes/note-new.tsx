// file: src/routes/note-new.tsx
import { Title } from '@solidjs/meta';
import { makeTitle } from '../route-path';
import { NoteEdit } from '../components/note-edit';

function NoteNew() {
	return (
		<>
			<Title>{makeTitle('New Note')}</Title>
			<NoteEdit noteId={undefined} initialTitle={'Untitled'} initialBody={''} />
		</>
	);
}

export { NoteNew };
