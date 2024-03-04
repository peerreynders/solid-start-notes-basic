// @ts-check
// file: index.js
import polka from 'polka';
import sirv from 'sirv';
import { parse } from 'regexparam';

/** @typedef { import('node:fs').Stats } Stats */
/** @typedef { import('node:http').ServerResponse } ServerResponse */

const pathNoStore = ['/', '/map(.html)?', '/main.js', '/style.css'];
const patternNoStore = pathNoStore.map((uriTemplate) => parse(uriTemplate));

/**
 * @param { ServerResponse } res
 * @param { string } pathname
 * @param { Stats } _stats
 */
function setHeaders(res, pathname, _stats) {
	const value = patternNoStore.some((route) => route.pattern.test(pathname))
		? 'no-store'
		: 'public,max-age=31536000,immutable';
	res.setHeader('Cache-Control', value);
}

const assets = sirv('public', {
	single: 'moq-page.html',
	setHeaders,
});

const port = 3040;

polka()
	.use(assets)
	.listen(port, () => {
		console.log(`> Running on localhost:${port}`);
	});

/*
 * http://localhost:3040/map (map.html) shows the links to the mapped out variations
 * for everything else page.html does the work
 */
