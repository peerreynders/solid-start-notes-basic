// file: src/routes/note.tsx
import { Title } from '@solidjs/meta';
import { useParams } from '@solidjs/router';
import { makeTitle } from '../route-path';

export default function Note() {
	const params = useParams();

	return (
		<>
			<Title>{makeTitle()}</Title>
			<div class="c-note-none">
				<span>{`Note (id: ${params.id})`}</span>
			</div>
		</>
	);
}
