import { useEffect, useState } from 'react';
import { getRedirectPaths } from '../utils/authFlow';

// Where to go after signing in, from ?redirect=. Read after mount instead of with
// useSearchParams, which would make Next skip server rendering for the whole form and
// show an empty page until JS loads. The first render has no redirect, which only
// changes link hrefs, nothing you can see.
export function useAuthRedirect() {
  const [paths, setPaths] = useState(() => getRedirectPaths(new URLSearchParams()));

  useEffect(() => {
    setPaths(getRedirectPaths(new URLSearchParams(window.location.search)));
  }, []);

  const redirectQuery = paths.redirect ? `?redirect=${encodeURIComponent(paths.redirect)}` : '';
  return { ...paths, redirectQuery };
}
