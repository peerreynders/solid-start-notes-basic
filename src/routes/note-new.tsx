// file: src/routes/note-new.tsx
import { Title } from '@solidjs/meta';
import { makeTitle } from '../route-path';

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
