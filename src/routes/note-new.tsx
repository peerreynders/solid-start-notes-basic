// file: src/routes/note-new.tsx
import { Title } from '@solidjs/meta';
import { makeTitle } from '../route-path';
import NoteEditor from '../components/note-edit';
//import NoteEditSkeleton from '../components/note-edit-skeleton';

export default function NoteNew() {
	return (
		<>
			<Title>{makeTitle('New Note')}</Title>
			<NoteEditor />
		</>
	);
} /*
import NoteEditSkeleton from '../components/note-edit-skeleton';

export default function NoteNew() {
	return (
		<>
			<Title>{makeTitle('New Note')}</Title>
			<NoteEditSkeleton />
		</>
	);
}
export default function NoteNew() {
	return (
		<>
			<Title>{makeTitle('New Note')}</Title>
			<div class="c-note-none">
				<span>Note New</span>
			</div>
		</>
	);
}
*/
