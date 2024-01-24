// @refresh reload
import { Router } from '@solidjs/router';
import EditButton from './components/edit-button';
import SearchField from './components/search-field';
import BriefList from './components/brief-list';
import './styles/critical.scss';

function Layout() {
	return (
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
					<EditButton kind={'new'} href={'/'}>
						New
					</EditButton>
				</section>
				<BriefList />
			</section>
			<section class="c-note-view c-main__column">
				<span class="note-text--empty-state">
					Click a note on the left to view something! 🥺
				</span>
			</section>
		</main>
	);
}

export default function App() {
	return <Router root={Layout} />;
}
