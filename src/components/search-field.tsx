import { debounce } from '../lib/debounce';
import { useNoteList } from './note-list-context';
import Spinner from './spinner';

export default function SearchField() {
  const { search: handle } = useNoteList();
  const setSearchText = debounce(handle.searchText, 250);
  const noSubmit = (e: Event) => e.preventDefault();
  const updateSearch = (e: InputEvent & { currentTarget: HTMLInputElement, target: Element }) => {
    setSearchText(e.currentTarget.value);
  };

  // holder signal may or may not have the object
  // which holds the loading signal
  const notesLoading = () => handle.holder()?.loading() ?? false;

  return (
    <form class="search-field" role="search" onSubmit={ noSubmit }>
      <label class="offscreen" for="search-field__input">
        Search for a note by title
      </label>
      <input
        id='search-field__input'
	placeholder="Search"
	value={ handle.initial }
	onInput={ updateSearch }
      />
      <Spinner active={ notesLoading() }/>
    </form>
  );
}
