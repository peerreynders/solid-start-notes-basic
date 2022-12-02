# SolidStart Notes (basic)
First exploration of SolidStart (beta 0.2.6). The app is a port of the December 2020 [React Server Components Demo](https://github.com/reactjs/server-components-demo) ([LICENSE](https://github.com/reactjs/server-components-demo/blob/main/LICENSE); [no pg fork](https://github.com/pomber/server-components-demo/)) but here it's just a basic client side routed implementation. It doesn't use a database but just holds the notes in server memory synchronized to the `notes-db.json` file. This app is not intended to be deployed but simply serves as an experimental platform.

The longer term goal is to eventually leverage island routing to maximum effect once it's more stable and documented ([nksaraf](https://github.com/nksaraf) already demonstrated that [capability](https://github.com/solidjs/solid-start/tree/notes/examples/notes) ([live demo](https://notes-server-components.vinxi.workers.dev/)) with a non-standard branch of SolidStart).

```shell
$ npm i

$ npm run dev
```
---

## SolidStart highlights
[**File Based Routing**](https://start.solidjs.com/core-concepts/routing#creating-new-pages)
- `src/root.tsx` (layout shared by all routes; route content is projected via the [`<FileRoutes />`](https://start.solidjs.com/api/FileRoutes) component) 
- `src/routes/(note-empty).tsx` ➔ `/` (Home/root route; just an "empty" panel)
- `src/routes/new.tsx` ➔ `/new` (Route to compose a new note)
- `src/routes/notes/[id]/(note).tsx` ➔ `/notes/{id}` (Route showing the details of the currently active note `id`)
- `src/routes/notes/[id]/edit/(note-edit).tsx` ➔ `/notes/{id}/edit` (Route for modifying note `id`)

[**API Routing**](https://start.solidjs.com/core-concepts/api-routes)
- `src/routes/api/notes.ts` [`notes.ts`](./src/routes/api/notes.ts) implements the `GET` API route handler that searches all notes based on their title. Used by [`note-list.tsx`](./src/components/note-list.tsx) via [`createResource`](https://www.solidjs.com/docs/latest/api#createresource).

[**Server Data**](https://start.solidjs.com/api/createServerData)
- `createServerData$` and [`useRouteData`](https://start.solidjs.com/api/useRouteData) is used in [`(note).tsx`](./src/routes/notes/[id]/(note).tsx) and [`(note-edit).tsx`](./src/routes/notes/[id]/edit/(note-edit).tsx) to fetch a single note by ID. 

[**Actions**](https://start.solidjs.com/core-concepts/actions)
- [`createServerAction$`](https://start.solidjs.com/api/createServerAction) is used by [`note-editor.tsx`](./src/components/note-editor.tsx) to insert, update and delete a note.

## Notes
- Deleting the `notes-db.json` file will cause it to be re-seeded upon the next server start up.
- Issue: In [route-path.ts](./src/route-path.ts) the SSR origin in `noteSearchHref` is hardcoded to `http://localhost:3000`.
- [`note-list-context.tsx`](./src/components/note-list-context.tsx) is used facilitate communication between [`note-list.tsx`](./src/components/note-list.tsx) and its collaborators. The context holds four "handles":
  - `fetch: FetchHandle` is used by `note-list.tsx` itself:
    - `holder` is a signal used to send an object to `search-field.tsx`. That object "holds" a signal with the `loading` status (The Context is constructed without a reference to `NoteList` so the signal in the context can't be bound directly to the `NoteList`'s `loading` signal. So instead the context constructs a signal whose setter is exposed as `holder` that `NoteList` will eventually use to send an object holding the `loading` signal to `SearchField`).
    - `searchValue` is a signal accessor to `{ searchText: string, lastEdit: LastEdit }`. `searchText` is the search text provided by `search-field.tsx`. `lastEdit` is ignored but aggregated into `searchValue` by the context to force a refetch in `NoteList` whenever a note is inserted, updated or deleted.
    - `popLastEdit` allows `NoteList` to consume the [`LastEdit`](./src/types.ts) by `NoteEditor` (which just caused a refetch). In case of an update or insert the note with the matching ID will "flash".
  - `search: SearchHandle` is used by [`search-field.tsx`](./src/components/search-field.tsx):
    - `holder: Accessor<LoadingHolder | undefined>` is the accessor that eventually delivers the object holding the `loading` signal from `NoteList`. `SearchField` uses it to activate it's [`spinner.tsx`](./src/components/spinner.tsx);
    - `searchText: (text: string) => void` is the signal setter to send the latest search text to `NoteList`.
    - `initial: string` is the value that the context initialized the `searchText` signal to so that `SearchField` can initially display that value (this way `Searchfield` doesn't need to be given access to the `searchText` accessor).
  - `lastEdit: LastEditHandle` is used by [`note-editor.tsx`](./src/components/note-editor.tsx):
    - `lastEdit: (edit: LastEdit) => void` simply passes the `LastEdit` to be stored within the context. `NoteList` isn't notified until later when the page that the server action redirected to performs a "Post Redirect Complete".
  - `postRedirect: PostRedirectHandle` is used by both [`(note).tsx`](./src/routes/notes/[id]/(note).tsx) and [`(note-empty).tsx`](./src/routes/(note-empty).tsx) (redirected to by note update/insert and delete respectively; see [`note-editor.tsx`](./src/components/note-editor.tsx)):
    - `complete: () => void` will trigger `searchValue` if there is a `LastEdit` present; this will cause `NoteList` to refetch and consume the waiting `LastEdit` value with `popLastEdit`.
