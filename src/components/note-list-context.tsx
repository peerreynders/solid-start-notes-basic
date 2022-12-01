import { createSignal, createContext, useContext } from 'solid-js';

import type { Accessor, ParentProps } from 'solid-js';
import type { LastEdit } from '~/types';

type LoadingHolder = {
  loading: Accessor<boolean>
};

export type SearchValue = {
  searchText: string;
  lastEdit: LastEdit | undefined;
};

export type SearchHandle = {
  holder: Accessor<LoadingHolder | undefined>;
  searchText: (search: string) => void;
  initial: string;
}; 

export type FetchHandle = {
  holder: (loadingHolder: LoadingHolder) => void;
  searchValue: () => SearchValue;
  popLastEdit: () => (LastEdit | undefined);
};

export type LastEditHandle = {
  lastEdit: (edit: LastEdit) => void;
};

export type PostRedirectHandle = {
  complete: () => void;
};

const initialSearchText = '';

type NoteListContextType = { 
  search: SearchHandle; 
  fetch: FetchHandle; 
  lastEdit: LastEditHandle;
  postRedirect: PostRedirectHandle;
};

const NoteListContext = createContext<NoteListContextType>();

let lastEditData: LastEdit | undefined;

function NoteListProvider(props: ParentProps) {
  const initial = initialSearchText;
  
  // Signal from SearchField to NoteList with the search text 
  const [searchText, setSearchText] = createSignal(initial);

  // Signal from NoteList to SearchField
  // with an (eventual) object that holds a loading signal 
  const [holder, setHolder] = createSignal<LoadingHolder | undefined>();

  // 1) NoteEditor updates before redirect
  const storeLastEdit = (edit: LastEdit) => lastEditData = edit;

  // 2) After a redirect completes forward lastEdit to NoteList
  const [lastEdit, setLastEdit] = createSignal<LastEdit | undefined>(undefined, { equals: false });
  const redirectComplete = () => {
    if (typeof lastEditData !== 'undefined') setLastEdit(lastEditData);
  };

  // 3) searchValue combines searchText and lastEdit to ensure that changed
  // value will trigger a refetch
  const searchValue = () => ({ searchText: searchText(), lastEdit: lastEdit() });

  // 4) NoteList consumes lastEdit
  const popLastEdit = () => {
    const edit = lastEditData;
    lastEditData = undefined;
    return edit;
  };

  const search: SearchHandle = {
    holder,
    searchText: setSearchText,
    initial,
  };

  const fetchHandle: FetchHandle = {
    holder: setHolder,
    searchValue,
    popLastEdit,
  };
  
  const lastEditHandle: LastEditHandle = {
    lastEdit: storeLastEdit,
  };

  const postRedirect = {
    complete: redirectComplete,
  };

  const value = {
    search,
    fetch: fetchHandle,
    lastEdit: lastEditHandle,
    postRedirect,
  };

  return (
    <NoteListContext.Provider value={ value }>
      {props.children}
    </NoteListContext.Provider>
  );
}

function useNoteList(): NoteListContextType {
  const ctx = useContext(NoteListContext);
  if (!ctx) throw new Error('NoteListContext not initialized');

  return ctx;
}

export {
  NoteListProvider,
  useNoteList
};
