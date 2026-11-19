// The site moved from adorio.space to oakar.dev. This worker answers every adorio.space
// address (and www.oakar.dev) with a permanent redirect to the same path on oakar.dev.
const NEW_HOST = {
  'adorio.space': 'oakar.dev',
  'www.adorio.space': 'oakar.dev',
  'files.adorio.space': 'files.oakar.dev',
  'resume.adorio.space': 'resume.oakar.dev',
  'env.adorio.space': 'env.oakar.dev',
  'www.oakar.dev': 'oakar.dev',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = NEW_HOST[url.hostname];
    // a 301 lets browsers resend a POST as a GET without its body; 308 keeps the method
    const status = request.method === 'GET' || request.method === 'HEAD' ? 301 : 308;

    // nothing on oakar.dev matches a subdomain missing from the list, so go home
    const target = host ? `https://${host}${url.pathname}${url.search}` : 'https://oakar.dev/';
    return new Response(null, { status, headers: { location: target } });
  },
};
