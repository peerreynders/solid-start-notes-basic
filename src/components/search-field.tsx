// file: src/components/search-field.tsx
import { createUniqueId } from 'solid-js';
import { useIsRouting, useSearchParams } from '@solidjs/router';
import { debounce } from '../lib/debounce';
import { Spinner } from './spinner';

import type { SearchParams } from '../route-path';

function updateParams(set: (params: Partial<SearchParams>) => void) {
	const setParams = debounce<[Partial<SearchParams>]>(set, 250);

	return (
		event: InputEvent & {
			currentTarget: HTMLInputElement;
			target: HTMLInputElement;
		}
	) => {
		setParams({ search: event.currentTarget.value });
		event.preventDefault();
	};
}

const preventSubmit = (
	event: Event & { submitter: HTMLElement } & {
		currentTarget: HTMLFormElement;
		target: Element;
	}
) => event.preventDefault();

function SearchField() {
	const searchInputId = createUniqueId();
	const isRouting = useIsRouting();
	const [searchParams, setSearchParams] = useSearchParams<SearchParams>();
	const updateSearch = updateParams(setSearchParams);

	return (
		<form class="c-search-field" role="search" onSubmit={preventSubmit}>
			<label class="u-offscreen" for={searchInputId}>
				Search for a note by title
			</label>
			<input
				id={searchInputId}
				placeholder="Search"
				value={searchParams.search ?? ''}
				onInput={updateSearch}
			/>
			<Spinner active={isRouting()} />
		</form>
	);
}

export { SearchField };
