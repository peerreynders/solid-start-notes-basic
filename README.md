# solid-start-notes-basic
First exploration of SolidStart (beta 0.2.6). The app is a port of the December 2020 [React Server Components Demo](https://github.com/reactjs/server-components-demo) ([LICENSE](https://github.com/reactjs/server-components-demo/blob/main/LICENSE); [no pg fork](https://github.com/pomber/server-components-demo/)) but here it's just a basic client side routed implementation. It doesn't use a database but just holds the notes in server memory synchronized to the `notes-db.json file`. This app is not intended to be deployed but simply serves as an experimental platform.

The longer term goal is to eventually leverage island routing to maximum effect once it's more stable and documented ([nksaraf](https://github.com/nksaraf) already demonstrated that [capability](https://github.com/solidjs/solid-start/tree/notes/examples/notes) ([live demo](https://notes-server-components.vinxi.workers.dev/)) with a non-standard branch of SolidStart).

```shell
$ npm i

$ npm run dev
```
