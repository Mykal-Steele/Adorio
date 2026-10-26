import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// False while React is hydrating server HTML, true on every render after that. Hydration
// can happen late: /social streams its feed in a Suspense boundary that may hydrate after
// the session check has already finished. Anything rendered from client-only state (like
// who's signed in) has to match the server's version until then, or React throws the whole
// boundary away and renders it again.
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
