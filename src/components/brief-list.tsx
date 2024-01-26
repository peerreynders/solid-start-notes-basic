// file: src/components/brief-list.tsx
import { createSignal, createMemo, For, onMount, Show } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { isServer } from 'solid-js/web';
import {
	createAsync,
	useLocation,
	useNavigate,
	useParams,
} from '@solidjs/router';
import { getBriefs } from '../api';
import { hrefWithNote } from '../route-path';
import { makeBriefDateFormat } from '../lib/date-time';
import { Brief } from './brief';

import type { NoteBrief } from '../types';

const EmptyContent = (props: { search: string | undefined }) => (
	<div class="c-brief-empty">
		{props.search
			? `Couldn't find any notes titled "${props.search}"`
			: 'No notes created yet!'}{' '}
	</div>
);

function findNoteId(target: unknown) {
	if (
		!(
			target instanceof HTMLButtonElement &&
			target.classList.contains('js:c-brief__open')
		)
	)
		return undefined;

	const container = target.closest('div.js\\:c-brief');

	return container instanceof HTMLDivElement
		? container.dataset.noteId
		: undefined;
}

function briefDateFormat() {
	if (isServer) {
		return makeBriefDateFormat();
	} else {
		return makeBriefDateFormat(Intl.DateTimeFormat().resolvedOptions());
	}
}

type Props = {
	searchText: string | undefined;
};

export default function BriefList(props: Props) {
	// Active Note is the one navigated to
	// until another one is clicked
	const params = useParams();
	const [clickedId, setClickedId] = createSignal<[string, number]>(['', 0]);
	const active = createMemo<[string, number]>(
		(last) => {
			const navId = params.noteId ?? '';
			const [_id, lastTime] = last;
			const clicked = clickedId();
			return clicked[1] > lastTime ? clicked : [navId, performance.now()];
		},
		[params.noteId ?? '', performance.now()]
	);
	const activeId = () => active()[0];

	const location = useLocation();
	const navigate = useNavigate();
	const navigateToClicked = (event: MouseEvent) => {
		const noteId = findNoteId(event.target);
		if (!noteId) return;

		setClickedId([noteId, performance.now()]);
		navigate(hrefWithNote(location, noteId));
	};

	// Combining async with Store. See:
	// https://github.com/solidjs/solid-realworld/blob/f6e77ecd652bf32f0dc9238f291313fd1af7e98b/src/store/createComments.js#L4-L8
	// Note: briefs is a signal carrying a finer grained store
	const initialValue: NoteBrief[] = [];
	const [briefsStore, setBriefs] = createStore(initialValue);
	const briefs = createAsync(
		async () => {
			const next = await getBriefs(props.searchText);
			setBriefs(reconcile(next));
			return briefsStore;
		},
		{ initialValue }
	);

	const format = briefDateFormat();
	let root: HTMLElement | undefined;
	onMount(() => {
		if (root instanceof HTMLElement)
			root.addEventListener('click', navigateToClicked);
	});

	return (
		<nav ref={root}>
			<Show
				when={briefs().length}
				fallback={<EmptyContent search={props.searchText} />}
			>
				<ul class="c-brief-list">
					<For each={briefs()}>
						{(brief: NoteBrief) => (
							<li>
								<Brief
									noteId={brief.id}
									title={brief.title}
									summary={brief.summary}
									updatedAt={brief.updatedAt}
									active={activeId() === brief.id}
									pending={false}
									flushed={false}
									format={format}
								/>
							</li>
						)}
					</For>
				</ul>
			</Show>
		</nav>
	);
}
