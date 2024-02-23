// file: src/components/spinner.tsx
export type Props = {
	active: boolean;
};

function Spinner(props: Props) {
	return (
		<div
			class={'c-spinner' + (props.active ? ' c-spinner--active' : '')}
			role="progressbar"
			aria-busy={props.active}
		/>
	);
}

export { Spinner };
