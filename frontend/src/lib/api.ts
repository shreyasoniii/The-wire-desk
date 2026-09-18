import type { AuthUser, Credits, Platform, Post, PostStatus, SocialAccount } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";

const TOKEN_KEY = "wiredesk_token";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem(TOKEN_KEY) ||
    window.sessionStorage.getItem(TOKEN_KEY)
  );
}

// `persist: true` keeps the session across browser restarts (localStorage);
// `false` clears it as soon as the tab closes (sessionStorage) — this is
// what the login form's "Remember me" checkbox controls.
export function setToken(token: string, persist = true) {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  (persist ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok || body.success === false) {
    throw new ApiError(body.message || "Something went wrong", res.status);
  }

  return body as T;
}

// ---------- Auth ----------

export function registerUser(input: { name: string; email: string; password: string }) {
  return request<{ success: true; user: AuthUser; token: string }>(
    "/users/register",
    { method: "POST", body: JSON.stringify(input) }
  );
}

export function loginUser(input: { email: string; password: string }) {
  return request<{ success: true; user: AuthUser; token: string }>(
    "/users/login",
    { method: "POST", body: JSON.stringify(input) }
  );
}

export function getProfile() {
  return request<{ success: true; user: AuthUser }>("/users/profile");
}

export function updateProfile(input: { name?: string; email?: string; password?: string }) {
  return request<{ success: true; message: string; user: AuthUser }>(
    "/users/profile",
    { method: "PUT", body: JSON.stringify(input) }
  );
}

export function getCredits() {
  return request<{ success: true; data: Credits }>("/users/credits");
}

// ---------- AI ----------

export function generateAiPost(input: {
  topic: string;
  platform: Platform;
  tone: string;
  audience: string;
}) {
  return request<{
    success: true;
    message: string;
    data: string;
    usedFallback: boolean;
    creditsRemaining?: number;
  }>("/ai/generate", { method: "POST", body: JSON.stringify(input) });
}

// ---------- Posts ----------

export function getAllPosts() {
  return request<{ success: true; data: Post[] }>("/posts");
}

export function getPostById(id: string) {
  return request<{ success: true; data: Post }>(`/posts/${id}`);
}

export function createPost(input: {
  topic: string;
  platform: Platform;
  tone: string;
  audience: string;
  content: string;
  mediaUrl?: string;
}) {
  return request<{ success: true; message: string; data: Post }>("/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePost(
  id: string,
  input: Partial<{
    topic: string;
    platform: Platform;
    tone: string;
    audience: string;
    content: string;
    status: PostStatus;
    mediaUrl: string;
  }>
) {
  return request<{ success: true; message: string; data: Post }>(
    `/posts/${id}`,
    { method: "PUT", body: JSON.stringify(input) }
  );
}

export function deletePost(id: string) {
  return request<{ success: true; message: string }>(`/posts/${id}`, {
    method: "DELETE",
  });
}

export function schedulePost(
  id: string,
  input: { scheduledAt: string; autoRegenerate?: boolean }
) {
  return request<{ success: true; message: string; data: Post }>(
    `/posts/${id}/schedule`,
    { method: "POST", body: JSON.stringify(input) }
  );
}

export function publishPost(id: string, input: { mediaUrl?: string } = {}) {
  return request<{ success: true; message: string; data: Post }>(
    `/posts/${id}/publish`,
    { method: "POST", body: JSON.stringify(input) }
  );
}

// ---------- Social accounts ----------

export function getSocialAccounts() {
  return request<{ success: true; data: SocialAccount[] }>("/social");
}

export function disconnectSocialAccount(id: string) {
  return request<{ success: true; message: string }>(`/social/${id}`, {
    method: "DELETE",
  });
}

export function connectSocialAccountManually(input: {
  platform: Platform;
  username: string;
  platformUserId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}) {
  return request<{ success: true; message: string; data: SocialAccount }>(
    "/social/connect",
    { method: "POST", body: JSON.stringify(input) }
  );
}

function oauthConnectUrl(platform: "linkedin" | "x" | "instagram") {
  return request<{ success: true; data: { url: string } }>(
    `/social/${platform}/connect`
  );
}

export async function startOauthConnect(platform: Platform) {
  const key =
    platform === "LinkedIn" ? "linkedin" : platform === "X" ? "x" : "instagram";
  const { data } = await oauthConnectUrl(key);
  window.location.href = data.url;
}
