// file: src/components/edit-button.tsx
import { useLocation, useNavigate } from '@solidjs/router';
import { hrefToNoteEdit, hrefToNoteNew } from '../route-path';

import type { ParentProps } from 'solid-js';

type Props = ParentProps & {
	kind: 'edit' | 'new';
};

const classList = (kind: Props['kind']) =>
	'c-edit-button' +
	(kind === 'new' ? ' c-edit-button--new' : ' c-edit-button--modify');

export default function EditButton(props: Props) {
	const location = useLocation();
	const navigate = useNavigate();
	const toHref = props.kind === 'new' ? hrefToNoteNew : hrefToNoteEdit;

	return (
		<button
			class={classList(props.kind)}
			onClick={() => navigate(toHref(location))}
			disabled={false}
		>
			{props.children}
		</button>
	);
}
