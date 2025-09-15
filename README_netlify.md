# Netlify proxy deployment for 420360

This repository includes a Netlify Function that proxies requests to a Google Apps Script web app so that CORS headers are added and the browser can call the API from GitHub Pages or other static hosts.

Files added:
- `netlify/functions/proxy.js` - serverless function forwarding GET/POST/OPTIONS to the Apps Script and returning CORS headers.
- `netlify.toml` - existing build config pointing functions to `netlify/functions` (already present).

Quick deploy steps:
1. Push this repository to GitHub.
2. Create a Netlify account (https://app.netlify.com/) and connect your GitHub repository.
3. In Netlify's site settings, set the build command and publish directory if needed. For static GitHub Pages sites this repo likely has no build; you can leave build command empty and set publish directory to the repo root.
4. Netlify will detect functions in `netlify/functions`. After deploy, your function will be available at:

   `https://<your-site>.netlify.app/.netlify/functions/proxy`

5. Update `board/index.html` to use the proxy URL (already updated to use `/.netlify/functions/proxy` when hosted on Netlify).

Notes:
- The proxy currently uses `Access-Control-Allow-Origin: *`. For stricter security, change this to your GitHub Pages domain (e.g. `https://420360.xyz`).
- If your Apps Script requires authentication, you'll need to adjust the flow; this proxy forwards requests anonymously.
- Test with `curl`:

```
curl -i https://<your-site>.netlify.app/.netlify/functions/proxy
```

If you want, I can also add a small `package.json` and tests for the function, or change the CORS origin to a specific domain.
