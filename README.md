# SolidStart Notes (basic)

- [Overview](#overview)
- [SolidStart Highlights](#solidstart-highlights)
  - [File Based Routing](#file-based-routing)
  - [API Routing](#api-routing)
  - [Server Data](#server-data)
  - [Actions](#server-actions)
- [Notes](#notes)
- [Observations](#observations)
  - [Suspense/Show Interaction](#suspenseshow-interaction)
  - [Suspense Leaks](#suspense-leaks)

## Overview
First exploration of SolidStart (beta 0.2.6). The app is a port of the December 2020 [React Server Components Demo](https://github.com/reactjs/server-components-demo) ([LICENSE](https://github.com/reactjs/server-components-demo/blob/main/LICENSE); [no pg fork](https://github.com/pomber/server-components-demo/)) but here it's just a basic client side routing implementation. It doesn't use a database but just holds the notes in server memory synchronized to the `notes-db.json` file. This app is not intended to be deployed but simply serves as an experimental platform.

The longer term goal is to eventually leverage island routing to maximum effect once it's more stable and documented ([nksaraf](https://github.com/nksaraf) already demonstrated that [capability](https://github.com/solidjs/solid-start/tree/notes/examples/notes) ([live demo](https://notes-server-components.vinxi.workers.dev/)) with a non-standard branch of SolidStart).

```shell
$ npm i

added 359 packages, and audited 360 packages in 3s

37 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

$ npm run dev -- --open

> solid-start-notes-basic@0.0.0 dev
> solid-start dev

 solid-start dev 
 version  0.2.6
 adapter  node

  VITE v3.2.4  ready in 530 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  Inspect: http://localhost:3000/__inspect/


  ➜  Page Routes:
     ┌─ http://localhost:3000
     ├─ http://localhost:3000/*404
     ├─ http://localhost:3000/new
     ├─ http://localhost:3000/notes/:id
     └─ http://localhost:3000/notes/:id/edit

  ➜  API Routes:
     └─  http://localhost:3000/api/notes GET

  > Server modules: 
   http://localhost:3000/_m/*
```
---

## SolidStart highlights
<a name="file-based-routing"/>

[**File Based Routing**](https://start.solidjs.com/core-concepts/routing#creating-new-pages)
- `src/root.tsx` (layout shared by all routes; route content is projected via the [`<FileRoutes />`](https://start.solidjs.com/api/FileRoutes) component) 
- `src/routes/(note-empty).tsx` ➔ `/` (Home/root route; just an "empty" panel)
- `src/routes/new.tsx` ➔ `/new` (Route to compose a new note)
- `src/routes/notes/[id]/(note).tsx` ➔ `/notes/{id}` (Route showing the details of the currently active note `id`)
- `src/routes/notes/[id]/edit/(note-edit).tsx` ➔ `/notes/{id}/edit` (Route for modifying note `id`)

<a name="api-routing"/>

[**API Routing**](https://start.solidjs.com/core-concepts/api-routes)
- `src/routes/api/notes.ts` [`notes.ts`](./src/routes/api/notes.ts) implements the `GET` API route handler that searches all notes based on their title. Used by [`note-list.tsx`](./src/components/note-list.tsx) via [`createResource`](https://www.solidjs.com/docs/latest/api#createresource).

<a name="server-data"/>

[**Server Data**](https://start.solidjs.com/api/createServerData)
- `createServerData$` and [`useRouteData`](https://start.solidjs.com/api/useRouteData) is used in [`(note).tsx`](./src/routes/notes/[id]/(note).tsx) and [`(note-edit).tsx`](./src/routes/notes/[id]/edit/(note-edit).tsx) to fetch a single note by ID. 

<a name="server-actions"/>

[**Actions**](https://start.solidjs.com/core-concepts/actions)
- [`createServerAction$`](https://start.solidjs.com/api/createServerAction) is used by [`note-editor.tsx`](./src/components/note-editor.tsx) to insert, update and delete a note.

## Notes
- Deleting the `notes-db.json` file will cause it to be re-seeded upon the next server start up.
- Issue: In [route-path.ts](./src/route-path.ts) the SSR origin in `noteSearchHref` is hardcoded to `http://localhost:3000`.
- [`note-list-context.tsx`](./src/components/note-list-context.tsx) is used facilitate communication between [`note-list.tsx`](./src/components/note-list.tsx) and its collaborators. The context holds four "handles":
  - `fetch: FetchHandle` is used by `note-list.tsx` itself:
    - `holder: (loadingHolder: LoadingHolder) => void` is a signal used to send an object to `search-field.tsx`. That object "holds" a signal with the `loading` status (The Context is constructed without a reference to `NoteList` so the signal in the context can't be bound directly to the `NoteList`'s `loading` signal. So instead the context constructs a signal whose setter is exposed as `holder` that `NoteList` will eventually use to send an object holding the `loading` signal to `SearchField`).
    - `searchValue: () => SearchValue` is a signal accessor to `{ searchText: string, lastEdit: LastEdit }`. `searchText` is the search text provided by `search-field.tsx`. `lastEdit` is ignored but aggregated into `searchValue` by the context to force a refetch in `NoteList` whenever a note is inserted, updated or deleted.
    - `popLastEdit: () => (LastEdit | undefined)` allows `NoteList` to consume the [`LastEdit`](./src/types.ts) by `NoteEditor` (which just caused a refetch). In case of an update or insert the note with the matching ID will "flash".
  - `search: SearchHandle` is used by [`search-field.tsx`](./src/components/search-field.tsx):
    - `holder: Accessor<LoadingHolder | undefined>` is the accessor that eventually delivers the object holding the `loading` signal from `NoteList`. `SearchField` uses it to activate it's [`spinner.tsx`](./src/components/spinner.tsx);
    - `searchText: (text: string) => void` is the signal setter to send the latest search text to `NoteList`.
    - `initial: string` is the value that the context initialized the `searchText` signal to so that `SearchField` can initially display that value (this way `Searchfield` doesn't need to be given access to the `searchText` accessor).
  - `lastEdit: LastEditHandle` is used by [`note-editor.tsx`](./src/components/note-editor.tsx):
    - `lastEdit: (edit: LastEdit) => void` simply passes the `LastEdit` to be stored within the context. `NoteList` isn't notified until later when the page that the server action redirected to performs a "Post Redirect Complete".
  - `postRedirect: PostRedirectHandle` is used by both [`(note).tsx`](./src/routes/notes/[id]/(note).tsx) and [`(note-empty).tsx`](./src/routes/(note-empty).tsx) (redirected to by note update/insert and delete respectively; see [`note-editor.tsx`](./src/components/note-editor.tsx)):
    - `complete: () => void` will trigger `searchValue` if there is a `LastEdit` present; this will cause `NoteList` to refetch and consume the waiting `LastEdit` value with `popLastEdit`.

## Observations

### Suspense/Show interaction

- [`<Suspense>`](https://www.solidjs.com/docs/latest/api#suspense) is used to hide its `children` while there are unresolved async events (resources being read) under it. Without a fallback the `children` are simply hidden; if a fallback is specified, the fallback is shown while the suspense boundary is waiting for the async events to settle. Any future async events (like re-fetches) will cause the fallback to be shown again (or the `children` to be hidden again).
- [`useTransition`](https://www.solidjs.com/docs/latest/api#usetransition) and [`startTransition`](https://www.solidjs.com/docs/latest/api#starttransition) are used to suppress the `<Suspense>` hiding/fallback on **subsequent** async events (re-fetches) and instead keep the previous `children` in place until all the async events settle. For the initial render however the hiding/fallback behaviour remains in place.
- [`<Show>`](https://www.solidjs.com/docs/latest/api#show) is typically nested inside of `<Suspense>`. While `<Suspense>` will hide its `children` when there are pending async events it doesn't prevent those children from trying to render against the pending values. So `<Show>` is used to prevent `children` from trying to render against values that aren't ready yet.
- The `<Suspense>` boundary is triggered by a "read" on a pending resource. Given a resource `name: Resource<string>` using `name()` counts as a resource read while `name.state` does not. So using `typeof name() !== 'undefined'` in the `<Show>`'s `when` will trigger the containing suspense boundary because a resource read is attempted; therefore the `<Suspense>` `fallback` is rendered. If however `name.state === 'ready'` is used in the `<Show>`'s `when`, the `<Show>`'s `fallback` will be shown because the containing suspense boundary **is not** triggered.

[Playground link](https://playground.solidjs.com/anonymous/599bd23b-3be9-48cb-878f-8d6272247634)

```TypeScript
function ReadTransition() {
  const fetchName = makeFetch();
  const [name, { refetch }] = createResource(fetchName);
  const [_pending, start] = useTransition();
  const nextName = () => start(refetch);
  const cycle = refetchSequencer(nextName);
  cycle();

  return (
    <>
      <header>Read: ✔ Transition: ✔</header>
      <Suspense fallback={<p>Fallback: Suspense RT</p>}>
        <Show
          when={typeof name() !== undefined}
          fallback={<p>Fallback: Show RT</p>}
        >
          <p>{name()}</p>
        </Show>
      </Suspense>
    </>
  );
}
```
`ReadTransition` will only show the `<Suspense>` `fallback` before the first fetch and will simply hold the old content until the render for subsequent fetches completes because:
- the action triggering the refetch is wrapped in a transition.
- the `<Show>`'s `when` performs a read on the resource which triggers the containing suspense boundary.

```TypeScript
function NoRead() {
  const fetchName = makeFetch();
  const [name, { refetch }] = createResource(fetchName);
  const cycle = refetchSequencer(refetch);
  cycle();
  return (
    <>
      <header>Read: ✖ Transition: ✖</header>
      <Suspense fallback={<p>Fallback: Suspense</p>}>
        <Show when={name.state === 'ready'} fallback={<p>Fallback: Show</p>}>
          <p>{name()}</p>
        </Show>
      </Suspense>
    </>
  );
}
```
`NoRead` will show the `<Show>` `fallback` before *every* fetch because:
- the `<Show>`'s `when` doesn't perform a read on the resource so the containing suspense boundary is not triggered.


### Suspense Leaks

Care should to be taken not to "read" a resource in a component's setup code (e.g. when setting up a memo) as that would **not** trigger the component's suspense boundary but the next higher containing suspense boundary. This essentially causes a "suspense leak" that will hide/replace a larger portion of the page than necessary.

[Playground link](https://playground.solidjs.com/anonymous/23378dbd-e158-43fe-aee6-24e6cecb5ec2)

```TypeScript
function Leak() {
  const [names] = createResource(fetchNames);

  // something expensive
  const count = createMemo(() => {
    // Oops
    const current = names();
    return current ? current.length : 0;
  });

  return (
    <Suspense fallback={<p>Fallback: Nested Suspense Leak</p>}>
      <Show when={typeof names() !== undefined}>
        <header>Leak ({count()})</header>
        <ul>
          <Index each={names()}>
            {(name, i) => (
              <li>
                {i + 1}: {name()}
              </li>
            )}
          </Index>
        </ul>
      </Show>
    </Suspense>
  );
}
```
When the `count` memo is created `const current = names[];` attempts to "read" the resource. This execution doesn't happen under the component's ("Nested") suspense boundary so it will trigger the suspense boundary of the container component instead.

```TypeScript
function LeakFixed() {
  const [names] = createResource(fetchNames);

  // something expensive
  const count = createMemo(() =>
    // better
    names.state === 'ready' ? names().length : 0
  );

  return (
    <Suspense fallback={<p>Fallback: Nested Suspense LeakFixed</p>}>
      <Show when={typeof names() !== undefined}>
        <header>LeakFixed ({count()})</header>
        <ul>
          <Index each={names()}>
            {(name, i) => (
              <li>
                {i + 1}: {name()}
              </li>
            )}
          </Index>
        </ul>
      </Show>
    </Suspense>
  );
}
```
In `LeakedFixed` the problem is avoided by using `names.state === 'ready'` instead which delays the "reading" of the resource until a point in time when it is already available.
