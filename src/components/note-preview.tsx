// file: src/components/note-preview.tsx
import { isServer } from 'solid-js/web';
import { mdToHtml as server } from '../server/md-to-html';
import { mdToHtml as client } from '../lib/md-to-html';

type Props = {
	body: string;
};

const mdToHtml = isServer ? server : client;

const NotePreview = (props: Props) => (
	<div class="c-note-preview">
		<div
			class="o-from-markdown"
			innerHTML={props.body ? mdToHtml(props.body) : ''}
		/>
	</div>
);

const NotePreviewSkeleton = () => (
	<div class="c-note-skeleton-preview">
		<div />
		<div />
		<div />
		<div />
		<div />
	</div>
);

export { NotePreview, NotePreviewSkeleton };
