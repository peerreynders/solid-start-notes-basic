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
import { nextToNote } from '../route-path';
import { makeBriefDateFormat } from '../lib/date-time';
import { Brief } from './brief';
import { useLastEdit, type LastEditHolder } from './app-context';

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

function setupBriefStore(currentSearch: () => string | undefined) {
	// Combining createAsync with Store. Inspired by:
	// https://github.com/solidjs/solid-realworld/blob/f6e77ecd652bf32f0dc9238f291313fd1af7e98b/src/store/createComments.js#L4-L8
	const [briefStore, setBriefs] = createStore<NoteBrief[]>([]);
	return [
		async function updateBriefStore() {
			const next = await getBriefs(currentSearch());
			setBriefs(reconcile(next));
			return briefStore;
		},
		{ initialValue: briefStore },
	] as const;
}

function deriveLastUpdateId(
	noteId: () => string,
	lastEdit: LastEditHolder['lastEdit']
) {
	const NO_UPDATED_ID = '';

	return () => {
		const last = lastEdit();
		switch (last?.[0]) {
			case undefined:
			case 'delete': {
				return NO_UPDATED_ID;
			}
			case 'update': {
				return last[1];
			}
			case 'new': {
				// IDs are server assigned so get it form the URL
				// of the currently open note.
				const id = noteId();
				return typeof id === 'string' && id.length > 0 ? id : NO_UPDATED_ID;
			}
			default:
				return NO_UPDATED_ID;
		}
	};
}

type ClickedInfo = {
	noteId: string;
	pathname: string;
};

type Props = {
	searchText: string | undefined;
};

function BriefList(props: Props) {
	const params = useParams();
	const noteId = () => params.noteId ?? '';
	const location = useLocation();
	const [clickedInfo, setClickedInfo] = createSignal<ClickedInfo>({
		noteId: noteId(),
		pathname: location.pathname,
	});
	const pendingId = createMemo(() =>
		clickedInfo().pathname !== location.pathname ? clickedInfo().noteId : ''
	);

	// Highlight clicked brief BEFORE initiating
	// navigation to the associated note
	const navigate = useNavigate();
	const navigateToClicked = (event: MouseEvent) => {
		const id = findNoteId(event.target);
		if (!id) return;

		const next = nextToNote(location, id);
		setClickedInfo({ noteId: id, pathname: next.pathname });
		navigate(next.href);
	};

	// updatedId
	const { lastEdit } = useLastEdit();
	const updatedId = createMemo(deriveLastUpdateId(noteId, lastEdit));

	// Note: briefs is a signal carrying a finer grained store
	const briefs = createAsync(...setupBriefStore(() => props.searchText));

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
									active={noteId() === brief.id}
									pending={pendingId() === brief.id}
									flushed={updatedId() === brief.id}
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

export { BriefList };
