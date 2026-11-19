// Live links on this site are paths like /coding, so they get the domain in front
export const liveLabel = (url: string) =>
  url.startsWith('/') ? `oakar.dev${url}` : url.replace(/^https?:\/\//, '').replace(/\/$/, '');
