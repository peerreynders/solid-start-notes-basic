// file: src/components/brief-list.tsx
import { For, Show, Suspense } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { isServer } from 'solid-js/web';
import { createAsync, useSearchParams } from '@solidjs/router';
import { getBriefs } from '../api';
import { makeBriefDateFormat } from '../lib/date-time';
import { Brief } from './brief';

import type { SearchParams } from '../route-path';
import type { NoteBrief } from '../types';

const EmptyContent = (props: { search: string | undefined }) => (
	<div class="c-brief-empty">
		{props.search
			? `Couldn't find any notes titled "${props.search}"`
			: 'No notes created yet!'}{' '}
	</div>
);

function briefDateFormat() {
	if (isServer) {
		return makeBriefDateFormat();
	} else {
		return makeBriefDateFormat(Intl.DateTimeFormat().resolvedOptions());
	}
}

export default function BriefList() {
	const [searchParams] = useSearchParams<SearchParams>();

	// Combining async with Store. See:
	// https://github.com/solidjs/solid-realworld/blob/f6e77ecd652bf32f0dc9238f291313fd1af7e98b/src/store/createComments.js#L4-L8
	// Note: briefs is a signal carrying a finer grained store
	const initialValue: NoteBrief[] = [];
	const [briefsStore, setBriefs] = createStore(initialValue);
	const briefs = createAsync(
		async () => {
			const next = await getBriefs(searchParams.search);
			setBriefs(reconcile(next));
			return briefsStore;
		},
		{ initialValue }
	);

	const format = briefDateFormat();

	return (
		<Suspense>
			<nav>
				<Show
					when={briefs().length}
					fallback={EmptyContent({ search: searchParams.search })}
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
										active={false}
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
		</Suspense>
	);
}
