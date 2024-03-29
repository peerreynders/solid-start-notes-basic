// file: src/routes/not-found.tsx
import { Title } from '@solidjs/meta';
import { HttpStatusCode } from '@solidjs/start';
import { makeTitle } from '../route-path';

function NotFound() {
	return (
		<div class="c-not-found">
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
		</div>
	);
}

export { NotFound };
