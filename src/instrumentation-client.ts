export function onRouterTransitionStart() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('adorio:nav-start'));
  }
}
