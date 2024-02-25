// file: src/entry-server.tsx
import { createHandler, StartServer } from '@solidjs/start/server';
// See: src/lib/md-to-html.ts
import { mdToHtml } from './server/md-to-html';

declare global {
	// eslint-disable-next-line no-var
	var ssrSupport: {
		mdToHtml: (mdText: string) => string;
	};
}

globalThis.ssrSupport = {
	mdToHtml,
};

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link rel="icon" href="/favicon.ico" />
					{assets}
				</head>
				<body>
					<div id="app">{children}</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));
