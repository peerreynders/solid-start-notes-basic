/// <reference types="@solidjs/start/env" />

declare module global {
	interface envDependency {
		mdToHtml: (mdText: string) => string;
	}
}
