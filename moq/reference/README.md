A moq (mock-up/maquette) page to explore the [React Server Components Demo](https://github.com/reactjs/server-components-demo) use of [`style.css`](https://github.com/reactjs/server-components-demo/blob/main/public/style.css).

It serves as the visual reference implementation for the port's styling with [Sass](https://sass-lang.com/).

Rather than launching the full React application this is just a page that cobbles together the DOM client side from [`<template>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) elements based on what it finds in [`location.href`](https://developer.mozilla.org/en-US/docs/Web/API/Location/href).
The server is used to handle [`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) headers; discouraging the caching of assets that are intentionally volatile while encouraging caching of the rest.

```shell
$ pnpm i

Lockfile is up to date, resolution step is skipped
Packages: +93
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 93, reused 93, downloaded 0, added 93, done

dependencies:
+ polka 0.5.2
+ regexparam 3.0.0
+ sirv 2.0.4

devDependencies:
+ @rollup/plugin-commonjs 25.0.7
+ @rollup/plugin-node-resolve 15.2.3
+ @rollup/plugin-terser 0.4.4
+ @types/node 20.11.22
+ @types/polka 0.5.7
+ @types/sanitize-html 2.11.0
+ marked 12.0.0
+ nanoid 5.0.6
+ prettier 3.2.5
+ rollup 4.12.0
+ sanitize-html 2.12.1
+ typescript 5.3.3

Done in 488ms

$ pnpm run serve

> reference@0.0.0 serve moq/reference
> node index.js

> Running on localhost:3040
```

Once the server is running open [`http://localhost:3040/map`](http://localhost:3040/map) which will list a series of links with hardcoded `href`s which navigate to a specific “page view”. Beyond that the page isn't interactive (except for the expansion toggles on the note briefs).
