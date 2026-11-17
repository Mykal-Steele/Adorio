# Hosting

`hosts.json` is the list of places the app runs. The Cloudflare Worker in `cloudflare-worker/` sends each request to the first host on the list that is up, and moves down the list when one fails. Every response carries an `X-Served-By` header with the name of the host that answered.

Every host runs the same Docker image and answers `GET /api/health` with 200 when it can serve traffic.

## Move to a new host or add one

1. Run the image on the new platform with the same env vars.
2. Check `https://<new origin>/api/health` answers 200.
3. Add it to `hosts.json`. Order is priority: first is the primary.
4. Deploy the Worker: `cd cloudflare-worker && npx wrangler deploy`.

To take a host out for a while, set `"enabled": false` on it and deploy the Worker again.

## How failover works

- Two failed requests or health checks in a row mark a host down. Two good health checks bring it back.
- A cron trigger checks `/api/health` on every host every 5 minutes. This also keeps hosts that scale to zero (Cloud Run) from going cold, because they stay up for up to 15 minutes after a request.
- A GET that times out or gets a 5xx is tried on the next host. A POST, PUT, PATCH or DELETE is only sent to the next host if the first one refused the connection. If it timed out it may already have been saved, so the visitor gets a 504 instead of a duplicate.
- If every host is marked down, the Worker still tries them all in order before answering 502.
