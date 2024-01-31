// file: src/routes/note-none.tsx
import { Title } from '@solidjs/meta';
import { makeTitle } from '../route-path';

export default function NoteNone() {
	return (
		<>
			<Title>{makeTitle()}</Title>
			<div class="c-note-none">
				<span>Click a note on the left to view something! 🥺</span>
			</div>
		</>
	);
}
