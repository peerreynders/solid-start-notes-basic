// file: src/components/edit-button.tsx
import type { ParentProps } from 'solid-js';

type Props = ParentProps & {
	kind: 'edit' | 'new';
	href: string;
};

export default function EditButton(props: Props) {
	return (
		<button
			class={
				'c-edit-button' +
				(props.kind === 'edit' ? ' c-edit-button--edit' : ' c-edit-button--new')
			}
			onClick={() => void 0}
			disabled={false}
		>
			{props.children}
		</button>
	);
}
