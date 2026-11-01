# Security policy

I run Adorio (adorio.space) by myself, and I want to hear about any security problem you find in it.

## How to report

Use GitHub's private reporting. Open the [Security tab](https://github.com/Mykal-Steele/Adorio/security/advisories/new) of this repo and choose "Report a vulnerability". Only I can see what you send there.

Please don't open a public issue or post the details anywhere until I have fixed it.

A good report has:

- what you found and where (a URL, an API route, or a file path)
- the steps to reproduce it
- what an attacker could do with it

A small proof of concept helps. A long write-up isn't needed.

## What to expect

- I will reply within 7 days.
- I aim to fix serious problems (exposed data, account takeover, running code on the server) within 30 days. Smaller ones may take longer. I will tell you when it is fixed.
- If you want credit, I will name you in the advisory. If you don't, I won't.

## Supported versions

Only the live site and the `main` branch. There are no older releases to patch.

## In scope

- adorio.space and its `/api` routes
- The code in this repo, including the Next.js app, the Express backend, and the code runner integration

Examples I care about: getting into another person's account or data, bypassing login or admin checks, injection, cross-site scripting, unsafe file uploads, escaping the code runner sandbox, and secrets committed to the repo.

## Out of scope

- The SecretEnv routes (`/api/secretenv`) need no login on purpose. Each entry is encrypted with a passphrase. "It has no auth" is not a bug, but a flaw in how the encryption works is.
- Denial of service, load testing, spam, and brute forcing.
- Output from an automated scanner that doesn't show a real attack.
- Missing security headers or an outdated dependency, unless you can show a working exploit.
- Social engineering, phishing, and physical attacks.
- Problems in services I use but don't run, such as the hosting, CDN, database, and image providers. Please report those to the provider.

## Testing rules

- Use accounts you create yourself.
- Don't read, change, or delete other people's data. If you reach it by accident, stop and tell me.
- Keep tests against the code runner small. It is one shared machine that costs me money while it runs.

If you follow these rules and report in good faith, I won't take legal action against you.
