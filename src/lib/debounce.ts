import { getOwner, onCleanup } from 'solid-js';

function fake() {
  const noop = () => void 0;
  return Object.assign( noop, { clear: noop });
}; 

// https://github.com/solidjs-community/solid-primitives/blob/main/packages/scheduled/src/index.ts 

export function debounce<Args extends unknown[]>(
  callback: (...arg: Args) => void, 
  wait: number
) {
  if (process?.env?.SSR) return fake();

  let timeoutId: (ReturnType<typeof setTimeout> | undefined);
  const clear = () => {
    if (!timeoutId) return;

    clearTimeout(timeoutId);
    timeoutId = undefined;
  };
  if (getOwner()) onCleanup(clear);

  let lastArgs: Parameters<typeof callback>;
  const run = () => {
    callback(...lastArgs);
    timeoutId = undefined;
  };

  const debounced: typeof callback = (...args) => {
    lastArgs = args;
    clear();
    timeoutId = setTimeout(run, wait);
  };

  return Object.assign(debounced, { clear });
}
