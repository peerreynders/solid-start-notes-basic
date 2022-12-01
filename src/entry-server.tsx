import {
  createHandler,
  renderAsync,
  StartServer,
} from "solid-start/entry-server";

import { start } from './server/notes-db';

export default createHandler(
  renderAsync(
    (event) => {
      start();
      return (<StartServer event={event} />);
  })
);
