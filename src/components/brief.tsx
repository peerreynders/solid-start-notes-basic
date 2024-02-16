// file: src/components/brief.tsx
import { createUniqueId, onMount, Show } from 'solid-js';
import { NoHydration } from 'solid-js/web';
import { localizeFormat, type FormatFn } from '../lib/date-time';

type Props = {
	noteId: string;
	title: string;
	summary: string;
	updatedAt: number;
	pending: boolean;
	active: boolean;
	flushed: boolean;
	format: FormatFn;
};

const CLASSNAME_FLASH = 'js:c-brief--flash';

const classListBrief = (flushed: boolean) =>
	'js:c-brief c-brief' + (flushed ? ' ' + CLASSNAME_FLASH : '');

const classListOpen = (
	active: boolean | undefined,
	pending: boolean | undefined
) =>
	'js:c-brief__open c-brief__open' +
	(active ? ' c-brief--active' : '') +
	(pending ? ' c-brief--pending' : '');

function Brief(props: Props) {
	let brief: HTMLDivElement | undefined;
	function removeFlash(event: AnimationEvent) {
		if (event.animationName === 'flash')
			brief?.classList.remove(CLASSNAME_FLASH);
	}

	let header: HTMLElement | undefined;
	const toggleId = createUniqueId();
	// non-reactive
	const [updatedAt, updatedISO] = props.format(props.updatedAt);

	onMount(() => {
		// After hydration correct the display date/time
		// if it deviates from the server generated one
		// (a request may carry the locale but not the timezone)
		// Also `ref` doesn't work on elements inside `NoHydration`
		localizeFormat(props.format, header);
	});

	return (
		<div
			ref={brief}
			class={classListBrief(props.flushed)}
			onAnimationEnd={removeFlash}
			data-note-id={props.noteId}
		>
			<header ref={header}>
				<strong>{props.title}</strong>
				<NoHydration>
					<time datetime={updatedISO}>{updatedAt}</time>
				</NoHydration>
			</header>
			<input id={toggleId} type="checkbox" class="c-brief__summary-state" />
			<button class={classListOpen(props.active, props.pending)}>
				Open note for preview
			</button>
			<label for={toggleId} class="c-brief__summary-toggle">
				<svg
					viewBox="0 0 512 512"
					aria-hidden="true"
					fill="currentColor"
					width="1em"
					height="1em"
				>
					<path d="M60 99.333l196 196 196-196 60 60-256 256-256-256z"></path>
				</svg>
			</label>
			<p class="c-brief__summary">
				<Show
					when={props.summary}
					fallback={<span class="c-brief__no-content">(No Content)</span>}
				>
					{props.summary}
				</Show>
			</p>
		</div>
	);
}

export { Brief };
