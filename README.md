# SolidStart Notes (basic)

> … in a Zone … where we can get like a lot of the benefits of RSCs without RSCs …

— [Musing on HTML Partials](https://youtu.be/N-QwFFqI8aQ?t=12170)

Updated for SolidStart v0.5.2 (new beta, [first beta version](https://github.com/peerreynders/solid-start-notes-basic/tree/2fe3462b30ab9008576339648f13d9457da3ff5f)). 
The app is a port of the December 2020 [React Server Components Demo](https://github.com/reactjs/server-components-demo) ([LICENSE](https://github.com/reactjs/server-components-demo/blob/main/LICENSE); [no pg fork](https://github.com/pomber/server-components-demo/), [Data Fetching with React Server Components](https://youtu.be/TQQPAU21ZUw)) but here it's just a basic client side routing implementation.
It doesn't use a database but stores the notes via the [Unstorage Node.js Filesystem (Lite) driver](https://unstorage.unjs.io/drivers/fs#nodejs-filesystem-lite) . This app is not intended to be deployed but simply serves as an experimental platform.


The longer term goal is to eventually leverage island routing to maximum effect once it's more stable and documented ([nksaraf](https://github.com/nksaraf) already demonstrated that [capability](https://github.com/solidjs/solid-start/tree/3f086d7660a6e29dea649e80ea5a7d2fc1ff5910/archived_examples/notes) ([live demo](https://notes-server-components.vinxi.workers.dev/)) with a non-standard branch of SolidStart).

---

## Route Design
The original's demo routing is managed by inside a single context ([`route.js`](https://github.com/reactjs/server-components-demo/blob/95fcac10102d20722af60506af3b785b557c5fd7/src/framework/router.js)) managing the following data:
- A content cache
- `location` consisting of:
    - `selectedId`
    - `isEditing`
    - `searchText`

This “triple” is used as a key to cache server content for that `location`.
The `location` is exposed in the URL as the [encoded URI component](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) value of the `location` [search parameter](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams); i.e.:

```TypeScript
const location = { selectedId: 2, isEditing: false, searchText: '' };
const searchParams = new URLSearchParams([
  ['location', JSON.stringify(location)],
]);
const base = 'http://localhost:4000/react';
console.log(`${base}?${searchParams.toString()}`);
// "http://localhost:4000/react?location=%7B%22selectedId%22%3A2%2C%22isEditing%22%3Afalse%2C%22searchText%22%3A%22%22%7D"
console.log(`${base}?location=${encodeURIComponent(JSON.stringify(location))}`);
```

- `refresh(response)` purges/reinitializes the content cache within a [transition](https://react.dev/reference/react/startTransition); while the next rendering has been initiated with fresh data from the server, the existing UI remains intact, fully capable of interrupting the current render with another state update.

- `navigate(location)` updates the `location` state within a transition.

- The `useMutation` hook sends the `payload` associated with `location` to the `endpoint` then using the response to `refresh` the content cache. The hook's state reflects the status of the fetch (`isSaving`) and stores the last error.

It needs to be explicitly stated: the RSC demo *does **not** support [SSR](https://www.patterns.dev/react/server-side-rendering/)*. 
RSCs render [`ReactNodes`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/f1f24cebc663e157637c343ca61766d5a9e00384/types/react/index.d.ts#L424C1-L436C1) that can either be directly inserted into the client's vDOM or deliver prop values to client side components.
The vDOM diffing process then manipulates the DOM accordingly. At no point is there any HTML that needs to be [hydrated](https://dev.to/this-is-learning/why-efficient-hydration-in-javascript-frameworks-is-so-challenging-1ca3); if needed, SSR and hydration is handled by the meta-framework (and its client side code).

The demo only employs [CSR](https://www.patterns.dev/react/client-side-rendering/); the value proposition of RSCs is that server components have access to server resources while their code is not part of the client bundle, instead the RSC client runtime has to be included in addition to React to support the deserialization of data streamed from RSCs.   

Any keys necessary for SSR need to appear in the path. So the **new** path-based routing becomes:

- `/?search=`**`:searchText`** i.e. `{selectedId: undefined, isEditing: false, searchText?}`
- `/new?search=`**`:searchText`** i.e. `{selectedId: undefined, isEditing: true, searchText?}`
- `/notes/`**`:selectedId`**`?search=`**`:searchText`** i.e. `{selectedId, isEditing: false, searchText?}`
- `/notes/`**`:selectedId`**`/edit?search=`**`:searchText`** i.e. `{selectedId, isEditing: true, searchText?}`

Note that `:selectedId` and `:searchText` can vary independently. In a typical usage scenario `:selectedId` will come from a `:searchText` search result but once `:selectedId` is referenced in the path, `:searchText` is free to change and return a result that does **not** include `:selectedId`.
Consequently the server functions are separate:
- `getBriefs`: fetches the note briefs that match `:searchText`.
- `getNote`: fetches the details of the `:selectedId` note.

```TypeScript
// file: src/api.ts
import { action, cache, redirect, revalidate } from '@solidjs/router';
// …
import {
  deleteNote as deleteNt,
  getBriefs as getBf,
  getNote as getNt,
  upsertNote as upsertNt,
} from './server/api';
// …
import type { NoteBrief, Note } from './types';
// …
const getBriefs = cache<
  (search: string | undefined) => Promise<NoteBrief[]>,
  Promise<NoteBrief[]>
>(async (search: string | undefined) => getBf(search), NAME_GET_BRIEFS);

const getNote = cache<
  (noteId: string) => Promise<Note | undefined>,
  Promise<Note | undefined>
>(async (noteId: string) => getNt(noteId), NAME_GET_NOTE);
// …
export { getBriefs, getNote, editAction };
```

Both of these functions are wrapped in [`solid-router`](https://github.com/solidjs/solid-router)'s [`cache()`](https://github.com/solidjs/solid-router?tab=readme-ov-file#cache). The page is fully server rendered on initial load but all subsequent updates are purely client rendered. 
But the router's `cache()` tracks the currently loaded `:noteId` and `:search` keys; so rather than running **both** `getBriefs` and `getNote` server fetches the router will only use the one whose key has actually changed (or both if both have changed).

So only the portion of the page that needs to change is updated on the client for `navigate()` even when the path changes.
The `search` parameter affects the content of the `<nav>` within the layout that is independent from any one `Route` component; `noteId` on the other hand directly impacts which `Route` component is chosen.

```TypeScript
// file: src/app.tsx
import { mergeProps, Suspense } from 'solid-js';
import { Route, Router, useSearchParams } from '@solidjs/router';
// …
import Note from './routes/note';
import NoteNew from './routes/note-new';
import NoteNone from './routes/note-none';
import NotFound from './routes/not-found';
// …
import type { ParentProps } from 'solid-js';
import type { RouteSectionProps } from '@solidjs/router';
// …
type NotePropsMerge = [{ edit: boolean }, RouteSectionProps];

export default function App() {
  const Edit = (props: RouteSectionProps) =>
    Note(mergeProps<NotePropsMerge>({ edit: true }, props));
  const Display = (props: RouteSectionProps) =>
    Note(mergeProps<NotePropsMerge>({ edit: false }, props));

  return (
    <Router root={Layout}>
      <Route path="/new" component={NoteNew} />
      <Route path="/notes/:noteId/edit" component={Edit} />
      <Route path="/notes/:noteId" component={Display} />
      <Route path="/" component={NoteNone} />
      <Route path="*404" component={NotFound} />
    </Router>
  );
}
```

Aside:
```TypeScript
// file: solid-router/src/types.ts

type Params = Record<string, string>;

interface Path {
  pathname: string;
  search: string;
  hash: string;
}

interface Location<S = unknown> extends Path {
  query: Params;
  state: Readonly<Partial<S>> | null;
  key: string;
}

interface RouteSectionProps<T = unknown> {
  params: Params;
  location: Location;
  data?: T;
  children?: JSX.Element;
}
```

## Layout ([“App Shell”](https://developer.chrome.com/blog/app-shell)) 
The orignal demo's layout is found in [`App.js`](https://github.com/reactjs/server-components-demo/blob/95fcac10102d20722af60506af3b785b557c5fd7/src/App.js) (server component) which **here** maps to [`app.tsx`](src/app.tsx) as
![Top-level layout](docs/assets/layout.jpg)

- `search-field.tsx` holds the text to match against the titles of the existing notes.
- `edit-bottom.tsx` triggers the opening of `note-new.tsx` in the `children` area
- `brief-list.tsx` displays all the briefs from notes where the title matches the contents `search-field`. Clicking a brief opens the matching `note.tsx` in `children`. `brief-list` serves as the application's navigation.
- `note-none.tsx` appears initially within `children`.
- `not-found.tsx` appears within `children` for malformed URLs. 

```TypeScript
// file: src/app.tsx
// …
import { Route, Router, useSearchParams } from '@solidjs/router';
import { MetaProvider } from '@solidjs/meta';
import EditButton from './components/edit-button';
import SearchField from './components/search-field';
import BriefList from './components/brief-list';
import BriefListSkeleton from './components/brief-list-skeleton';
// …
import type { ParentProps } from 'solid-js';
// …
import type { SearchParams } from './route-path';

function Layout(props: ParentProps) {
  const [searchParams] = useSearchParams<SearchParams>();
  return (
    <MetaProvider>
      <main class="c-main">
        <section class="c-sidebar c-main__column">
          <section class="c-sidebar__header">
            <img
              class="c-logo"
              src="/logo.svg"
              width="22px"
              height="20px"
              alt=""
              role="presentation"
            />
            <strong>Solid Notes</strong>
          </section>
          <section class="c-sidebar__menu" role="menubar">
            <SearchField />
            <EditButton kind={'new'}>New</EditButton>
          </section>
          <Suspense fallback={<BriefListSkeleton />}>
            <BriefList searchText={searchParams.search} />
          </Suspense>
        </section>
        <section class="c-note-view c-main__column">
          <Suspense>{props.children}</Suspense>
        </section>
      </main>
    </MetaProvider>
  );
}
```

Note the [Suspense](https://docs.solidjs.com/references/api-reference/control-flow/Suspense) boundary around `BriefList` and `props.children`. This way content under the suspense boundary is not displayed until all asynchonous values under it have resolved; meanwhile the `fallback` is shown when specified.

## Route Content (`Route` components)

In the orignal demo [`Note.js`](https://github.com/reactjs/server-components-demo/blob/95fcac10102d20722af60506af3b785b557c5fd7/src/Note.js) (a server component) plays the role of the router based on the `{ selectedId, isEditing, searchText }` location value.

As indicated earlier **here** we have the following mapping:
- `/` ➡ `note-none.tsx`
- `/new` ➡ `note-new.tsx`
- `/notes/:noteId` ➡ `note.tsx`
- `/notes/:noteId/edit` ➡ `note.tsx`

Here the server side functionality is captured in `getNote()`. SolidStart is responsible for generating the server code to generate the server side HTML, and the client side code for hydration and interactivity (which may include client side rendering but can be reduced to a minimum with islands in the future).   

### `not-found`

This is just the standard [404 Not Found](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404) content.

```tsx
// file: src/routes/not-found.tsx
import { Title } from '@solidjs/meta';
import { HttpStatusCode } from '@solidjs/start';
import { makeTitle } from '../route-path';

export default function NotFound() {
  return (
    <>
      <Title>{makeTitle('Not Found')}</Title>
      <HttpStatusCode code={404} />
      <h1>Page Not Found</h1>
      <p class="c-info-learn">
        Visit{' '}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{' '}
        to learn how to build SolidStart apps.
      </p>
    </>
  );
}
```

### `note-none`

Placeholder content until a `:noteId` is selected.

```jsx
// file: src/routes/note-none.tsx
import { Title } from '@solidjs/meta';
import { makeTitle } from '../route-path';

export default function NoteNone() {
  return (
    <>
      <Title>{makeTitle()}</Title>
      <div class="c-note-none">
        <span>Click a note on the left to view something! 🥺</span>
      </div>
    </>
  );
}
```

### `note-new`

### `note`

