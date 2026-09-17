# The Wire Desk — AI Social Media Automation

A full-stack app for AI-drafted social posts with scheduling and an
AI-credit system. Retro "newspaper wire desk" UI, no build step on the
frontend.

## Stack
- **Backend:** Node.js / Express / MongoDB (Mongoose) / JWT auth / OpenAI
- **Frontend:** plain HTML/CSS/JS (no framework, no build step)

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI, open_ai, JWT_SECRET
npm run dev             # or: npm start
```

The frontend is static — just open `frontend/index.html` in a browser,
or serve the folder with any static file server. It talks to the API at
`http://localhost:5050/api` (change `API_BASE` at the top of
`frontend/app.js` if your backend runs elsewhere).

**Important:** the `.env` values that shipped with the original upload
(Mongo password, OpenAI key, JWT secret) were exposed in this project
and should be treated as compromised — rotate all three before using
this in anything real.

## AI credits & the "no credit" case

Every user gets `monthlyCreditAllowance` AI credits (default 20),
tracked as `credits` on the User document, refilling automatically once
a calendar month has passed since the last refill.

- Every AI generation (`POST /api/ai/generate`, or the scheduler
  regenerating a post) spends 1 credit up front.
- **If the user has 0 credits**, the AI is never called — the request
  still succeeds, but returns **template-based fallback content**
  instead, with `usedFallback: true` in the response so the UI can flag
  it (see the "NO CREDIT — FALLBACK COPY" banner and the "FALLBACK"
  stamp on saved posts).
- If a credit was spent but the OpenAI call itself then fails (bad key,
  provider outage, etc.), the credit is refunded and the same fallback
  content is used instead — so a flaky AI provider never fails the
  request or silently drops a scheduled post.
- The background scheduler (`scheduler.service.js`, polls every 60s)
  applies the same logic when auto-regenerating scheduled posts: a
  post is **always published** at its scheduled time, with AI content
  if credits/AI are available, and fallback content if not.

Check current balance: `GET /api/users/credits`.

## API overview

All routes are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /users/register | – | Create account |
| POST | /users/login | – | Log in |
| GET | /users/profile | ✓ | Get profile |
| PUT | /users/profile | ✓ | Update profile |
| GET | /users/credits | ✓ | Current AI credit balance |
| POST | /ai/generate | ✓ | Generate 3 posts (AI or fallback) |
| GET | /posts | ✓ | List your posts |
| POST | /posts | ✓ | Save a post (draft) |
| GET | /posts/:id | ✓ | Get one post |
| PUT | /posts/:id | ✓ | Edit a post |
| DELETE | /posts/:id | ✓ | Delete a post |
| POST | /posts/:id/schedule | ✓ | Schedule (`scheduledAt`, `autoRegenerate`) |
| POST | /posts/:id/publish | ✓ | Publish immediately (`mediaUrl` optional override) |
| POST | /social/connect | ✓ | Manual/advanced: paste in a token yourself |
| GET | /social | ✓ | List connected accounts |
| DELETE | /social/:id | ✓ | Disconnect an account |
| GET | /social/linkedin/connect | ✓ | Get a LinkedIn OAuth consent URL |
| GET | /social/linkedin/callback | – | LinkedIn redirects here after consent |
| GET | /social/x/connect | ✓ | Get an X OAuth (PKCE) consent URL |
| GET | /social/x/callback | – | X redirects here after consent |
| GET | /social/instagram/connect | ✓ | Get a Facebook/Instagram consent URL |
| GET | /social/instagram/callback | – | Facebook redirects here after consent |

## Real platform publishing (Bureaus)

"Publish now" and scheduled auto-publish both try to actually post to the
connected account for that post's platform, not just mark it published
in-app. Each platform needs its own developer app, created by you:

**LinkedIn** — developer.linkedin.com, with the "Sign In with LinkedIn
using OpenID Connect" and "Share on LinkedIn" products added. Set
`LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`.

**X (Twitter)** — developer.x.com, OAuth 2.0 enabled on the app, with
`tweet.read tweet.write users.read offline.access` scopes. Set
`X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_REDIRECT_URI`. X's write-access
tiers/pricing have shifted over time — check your app's current access
level if posting fails with a 403.

**Instagram** — developers.facebook.com, with the Instagram Graph API
product added. Your Instagram account must be a Business/Creator account
linked to a Facebook Page you manage, and Meta requires App Review before
this works for anyone besides your own app's testers. Set `FB_APP_ID`,
`FB_APP_SECRET`, `FB_REDIRECT_URI`.
**Important:** Instagram's API cannot publish text-only posts — every
post needs an image/video URL (`mediaUrl` on the post). Connecting an
Instagram account always works; publishing without a `mediaUrl` will
fail with a clear error telling you to add one.

All three: also set `FRONTEND_URL` (so the OAuth callback can redirect
the browser back to your running frontend) and `TOKEN_ENCRYPTION_KEY`
(encrypts stored tokens at rest — generate with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

If a platform isn't configured, or a post's platform has no connected
account, publishing still succeeds in-app but is flagged
(`postedToRealPlatform: false`, `externalPostError: "..."`) rather than
failing the request — same philosophy as the AI credit fallback: an
unavailable integration should never silently block a scheduled post.
