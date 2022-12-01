// @refresh reload
import { Suspense } from "solid-js";
import {
  // A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";

import { noteNewHref } from './route-path';
import { NoteListProvider } from './components/note-list-context';
import SearchField from './components/search-field';
import EditButton from './components/edit-button';
import NoteList from './components/note-list';

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Solid Notes</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/style.css" rel="stylesheet" />	
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
	    <main>
              <NoteListProvider>
	        <section class="sidebar main__col">
                  <section class="sidebar-header">
                    <img
                      class="logo"
                      src="/logo.svg"
                      width="22px"
                      height="20px"
                      alt=""
                      role="presentation"
                    />
                    <strong>Solid Notes</strong>
                  </section>
                  <section class="sidebar-menu" role="menubar">
	            <SearchField />
		    <EditButton kind="new" href={ noteNewHref }>New</EditButton>
	          </section>
                  <nav>
                    <NoteList />
	          </nav>
	        </section>
		<section class="note-viewer main__col">
                  <Routes>
                    <FileRoutes />
                  </Routes>
	        </section>
	      </NoteListProvider>
	    </main>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
