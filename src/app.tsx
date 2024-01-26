// @refresh reload
import { Suspense } from 'solid-js';
import { Route, Router, useSearchParams } from '@solidjs/router';
import { MetaProvider } from '@solidjs/meta';
import EditButton from './components/edit-button';
import SearchField from './components/search-field';
import BriefList from './components/brief-list';
import BriefListSkeleton from './components/brief-list-skeleton';
import Note from './routes/note';
import NoteEdit from './routes/note-edit';
import NoteNew from './routes/note-new';
import NoteNone from './routes/note-none';
import NotFound from './routes/not-found';

import './styles/critical.scss';

import type { ParentProps } from 'solid-js';
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

export default function App() {
	return (
		<Router root={Layout}>
			<Route path="/new" component={NoteNew} />
			<Route path="/notes/:noteId/edit" component={NoteEdit} />
			<Route path="/notes/:noteId" component={Note} />
			<Route path="/" component={NoteNone} />
			<Route path="*404" component={NotFound} />
		</Router>
	);
}
