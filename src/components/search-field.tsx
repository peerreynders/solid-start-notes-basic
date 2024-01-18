// file: src/components/search-field.tsx
import { createUniqueId } from 'solid-js';
import Spinner from './spinner';

export default function SearchField() {
	const searchInputId = createUniqueId();
	return (
		<form
			class="c-search-field"
			role="search"
			onSubmit={(e) => e.preventDefault()}
		>
			<label class="u-offscreen" for={searchInputId}>
				Search for a note by title
			</label>
			<input
				id={searchInputId}
				placeholder="Search"
				value={' '}
				onInput={(e) => e.preventDefault()}
			/>
			<Spinner active={false} />
		</form>
	);
}
