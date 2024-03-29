// file: src/components/note-preview.tsx
import { mdToHtml } from '../lib/md-to-html';

type Props = {
	body: string;
};

const NotePreview = (props: Props) => (
	<div class="c-note-preview">
		<div
			class="o-from-markdown"
			innerHTML={props.body ? mdToHtml(props.body) : ''}
		/>
	</div>
);

export { NotePreview };
