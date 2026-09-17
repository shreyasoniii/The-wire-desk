# The Wire Desk

**AI-Powered Social Media Automation Platform**

The Wire Desk is a full-stack social media automation platform for drafting, managing, scheduling, and publishing social media content with AI assistance.

It combines an AI-powered content generation system with scheduled publishing, social account integrations, and a credit-based AI usage model. The frontend uses a retro newspaper-inspired "wire desk" interface and requires no frontend build step.

---

## Features

* AI-assisted social media post generation
* Generate multiple post variations from a single prompt
* Monthly AI credit allowance per user
* Automatic credit refill
* Template-based fallback when AI credits are exhausted
* Automatic credit refund when AI generation fails
* Draft post management
* Post editing and deletion
* Scheduled publishing
* Optional automatic AI regeneration before publishing
* LinkedIn OAuth integration
* X (Twitter) OAuth 2.0 with PKCE
* Instagram/Facebook OAuth integration
* Real platform publishing
* JWT-based authentication
* Encrypted storage of social platform tokens
* Graceful handling of unavailable third-party integrations
* Static frontend with no build pipeline

---

## Technology Stack

### Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT Authentication**
* **OpenAI API**

### Frontend

* **HTML5**
* **CSS3**
* **Vanilla JavaScript**
* No framework
* No build step

### External Integrations

* LinkedIn API
* X API
* Meta / Instagram Graph API
* OpenAI API

---

## Project Structure

```text
the-wire-desk/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── ...
│
├── .gitignore
└── README.md
```

> The exact directory structure may vary depending on the current implementation.

---

# Getting Started

## Prerequisites

Before running the application, install:

* Node.js 18+
* npm
* MongoDB
* Git

For AI generation:

* OpenAI API credentials

For social publishing:

* Developer credentials for the required social platform(s)

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd the-wire-desk
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the required environment variables in `.env`.

Start the development server:

```bash
npm run dev
```

Or start the production server:

```bash
npm start
```

The API runs by default at:

```text
http://localhost:5050
```

API base URL:

```text
http://localhost:5050/api
```

---

# Environment Configuration

Create `backend/.env` from `.env.example`.

Example:

```env
PORT=5050

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

OPENAI_API_KEY=your_openai_api_key

FRONTEND_URL=http://localhost:5500

TOKEN_ENCRYPTION_KEY=your_64_character_hex_key
```

### Social Platform Configuration

#### LinkedIn

```env
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=
```

#### X

```env
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REDIRECT_URI=
```

#### Meta / Instagram

```env
FB_APP_ID=
FB_APP_SECRET=
FB_REDIRECT_URI=
```

### Token Encryption Key

Generate a secure encryption key with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Store the generated value in:

```env
TOKEN_ENCRYPTION_KEY=
```

Never commit `.env` or production secrets to source control.

---

# Frontend

The frontend is a static application and does not require a build process.

Open:

```text
frontend/index.html
```

directly in a browser, or serve the directory using a static web server.

The frontend communicates with:

```text
http://localhost:5050/api
```

To use a different backend URL, update the `API_BASE` configuration in:

```text
frontend/app.js
```

For production, configure the frontend to use the deployed API URL.

---

# Authentication

Protected API endpoints use JWT authentication.

Include the token in the request:

```http
Authorization: Bearer <token>
```

Authentication flow:

```text
Register
   ↓
Login
   ↓
Receive JWT
   ↓
Store token
   ↓
Send token with protected API requests
```

---

# AI Credit System

The Wire Desk uses a credit-based system to control AI generation.

Each user receives a configurable monthly allowance.

Default:

```text
20 AI credits / month
```

Credits are stored on the user account.

The system automatically refills the user's allowance when the configured monthly refill period has elapsed.

---

## AI Generation Flow

When a user requests AI-generated content:

```text
AI Generation Request
        │
        ▼
Check Credit Balance
        │
        ├── Credits available
        │       │
        │       ▼
        │   Deduct 1 credit
        │       │
        │       ▼
        │   Call OpenAI
        │       │
        │       ├── Success → Return AI content
        │       │
        │       └── Failure → Refund credit + fallback
        │
        └── No credits
                │
                ▼
        Return fallback content
```

### No-Credit Behavior

When a user has zero credits:

* OpenAI is not called.
* The request still succeeds.
* Template-based content is returned.
* The response contains:

```json
{
  "usedFallback": true
}
```

The frontend can use this flag to display the fallback state.

---

## AI Provider Failure

If a credit is deducted but the OpenAI request fails:

1. The credit is refunded.
2. Template-based fallback content is generated.
3. The request still succeeds.
4. The user does not lose a credit because of an AI provider failure.

This prevents temporary provider failures from breaking the application workflow.

---

# Scheduled Posts

Posts can be scheduled for automatic publication.

A scheduled post may optionally enable:

```text
autoRegenerate
```

When enabled, the scheduler can regenerate the post using the same AI-credit rules used by manual generation.

The scheduler runs periodically in the backend and checks for posts whose scheduled publication time has been reached.

The current scheduler polling interval is:

```text
60 seconds
```

---

## Scheduler Behavior

At publication time:

```text
Scheduled Post
      │
      ▼
Auto-regeneration enabled?
      │
      ├── No ──► Publish existing content
      │
      └── Yes
            │
            ▼
       Check AI credits
            │
            ├── Available → Generate AI content
            │
            └── Unavailable → Use fallback
            │
            ▼
          Publish
```

The scheduler is designed so that unavailable AI services or exhausted credits do not prevent a scheduled post from being published.

---

# Social Media Integrations

The platform supports publishing to external social platforms.

Each platform requires its own developer application and credentials.

---

## LinkedIn

Create an application through LinkedIn's developer platform.

Required products include:

* Sign In with LinkedIn using OpenID Connect
* Share on LinkedIn

Required environment variables:

```env
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=
```

OAuth flow:

```text
Application
    ↓
LinkedIn Authorization
    ↓
Callback
    ↓
Access Token
    ↓
Encrypted Storage
    ↓
Publishing
```

---

## X

X uses OAuth 2.0.

Required scopes include:

```text
tweet.read
tweet.write
users.read
offline.access
```

Environment variables:

```env
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REDIRECT_URI=
```

X API access levels and pricing may change. Verify the current access level and write permissions in the X developer console if publishing returns authorization errors.

---

## Instagram

Instagram publishing uses the Meta platform.

The Instagram account must meet Meta's requirements, including being a supported Business or Creator account connected to a Facebook Page.

Environment variables:

```env
FB_APP_ID=
FB_APP_SECRET=
FB_REDIRECT_URI=
```

### Media Requirement

Instagram's publishing API requires media.

Therefore, text-only posts cannot be published directly to Instagram through this integration.

A post intended for Instagram must include:

```text
mediaUrl
```

If media is missing, the application returns an appropriate publishing error instead of silently failing.

Meta may also require App Review and appropriate permissions before an application can be used with accounts outside its development/test environment.

---

# Publishing Behavior

The application distinguishes between:

### In-App Publishing

The post is marked as published within The Wire Desk.

### External Publishing

The application successfully publishes the content to the connected social platform.

If an integration is unavailable, the application does not necessarily fail the entire publishing request.

Instead, the post can be marked with:

```json
{
  "postedToRealPlatform": false,
  "externalPostError": "..."
}
```

This allows scheduled workflows to complete while clearly exposing external publishing failures.

---

# API Reference

All API routes are prefixed with:

```text
/api
```

Protected routes require:

```http
Authorization: Bearer <token>
```

---

## Authentication

| Method | Endpoint          | Authentication | Description                         |
| ------ | ----------------- | -------------- | ----------------------------------- |
| POST   | `/users/register` | No             | Create a user account               |
| POST   | `/users/login`    | No             | Authenticate a user                 |
| GET    | `/users/profile`  | Yes            | Retrieve the current user's profile |
| PUT    | `/users/profile`  | Yes            | Update the current user's profile   |
| GET    | `/users/credits`  | Yes            | Retrieve current AI credit balance  |

---

## AI

| Method | Endpoint       | Authentication | Description                 |
| ------ | -------------- | -------------- | --------------------------- |
| POST   | `/ai/generate` | Yes            | Generate three social posts |

The endpoint can return AI-generated content or template-based fallback content depending on credit availability and AI provider status.

---

## Posts

| Method | Endpoint              | Authentication | Description              |
| ------ | --------------------- | -------------- | ------------------------ |
| GET    | `/posts`              | Yes            | List the user's posts    |
| POST   | `/posts`              | Yes            | Create/save a draft      |
| GET    | `/posts/:id`          | Yes            | Retrieve a specific post |
| PUT    | `/posts/:id`          | Yes            | Edit a post              |
| DELETE | `/posts/:id`          | Yes            | Delete a post            |
| POST   | `/posts/:id/schedule` | Yes            | Schedule a post          |
| POST   | `/posts/:id/publish`  | Yes            | Publish immediately      |

The publish endpoint may optionally accept:

```text
mediaUrl
```

to override or provide media for supported platforms.

---

## Social Accounts

| Method | Endpoint                     | Authentication | Description                 |
| ------ | ---------------------------- | -------------- | --------------------------- |
| POST   | `/social/connect`            | Yes            | Manually connect an account |
| GET    | `/social`                    | Yes            | List connected accounts     |
| DELETE | `/social/:id`                | Yes            | Disconnect an account       |
| GET    | `/social/linkedin/connect`   | Yes            | Start LinkedIn OAuth        |
| GET    | `/social/linkedin/callback`  | No             | LinkedIn OAuth callback     |
| GET    | `/social/x/connect`          | Yes            | Start X OAuth               |
| GET    | `/social/x/callback`         | No             | X OAuth callback            |
| GET    | `/social/instagram/connect`  | Yes            | Start Instagram OAuth       |
| GET    | `/social/instagram/callback` | No             | Instagram OAuth callback    |

---

# Example API Request

Generate posts:

```http
POST /api/ai/generate
Authorization: Bearer <token>
Content-Type: application/json
```

Example request body:

```json
{
  "topic": "The future of artificial intelligence",
  "platform": "linkedin"
}
```

A successful response may contain generated posts and credit information.

When fallback content is used:

```json
{
  "usedFallback": true
}
```

---

# Security

The following security practices should be followed in development and production:

* Never commit `.env` files.
* Never expose API keys in frontend code.
* Use strong, randomly generated JWT secrets.
* Use a unique encryption key for stored social tokens.
* Rotate credentials immediately if they are exposed.
* Use HTTPS in production.
* Restrict OAuth redirect URIs to trusted domains.
* Validate and sanitize API input.
* Apply appropriate authentication and authoriz
