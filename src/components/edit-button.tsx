// file: src/components/edit-button.tsx
import { useLocation, useNavigate } from '@solidjs/router';
import { hrefToNoteUpdate, hrefToNoteNew } from '../route-path';

import type { ParentProps } from 'solid-js';

type Props = ParentProps & {
	kind: 'update' | 'new';
};

const classList = (kind: Props['kind']) =>
	'c-edit-button' +
	(kind === 'new' ? ' js:c-edit-button--new' : ' js:c-edit-button--update');

function EditButton(props: Props) {
	const location = useLocation();
	const navigate = useNavigate();
	const toHref = props.kind === 'new' ? hrefToNoteNew : hrefToNoteUpdate;

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

export { EditButton };
