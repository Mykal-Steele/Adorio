export function onRouterTransitionStart(url: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adorio:nav-start', { detail: { url } }));
  }
}
