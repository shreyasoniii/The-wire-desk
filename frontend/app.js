// The Wire Desk — frontend logic. No build step, no framework: talks to the
// Express API directly with fetch. Change API_BASE if the backend isn't on
// the default local port.
const API_BASE = "http://localhost:5050/api";

const state = {
  token: localStorage.getItem("wd_token") || null,
  user: JSON.parse(localStorage.getItem("wd_user") || "null"),
  lastGeneratedText: "",
  lastGeneratedMeta: null,
  scheduleTargetId: null
};

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(message, isError = false) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 3800);
}

async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && state.token) headers.Authorization = `Bearer ${state.token}`;

  let res, data;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    data = await res.json();
  } catch (err) {
    throw new Error("Couldn't reach the server. Is the backend running on " + API_BASE + "?");
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

function setSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("wd_token", token);
  localStorage.setItem("wd_user", JSON.stringify(user));
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("wd_token");
  localStorage.removeItem("wd_user");
}

// ---------- auth screen ----------
$$(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".auth-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const isLogin = tab.dataset.tab === "login";
    $("#loginForm").classList.toggle("hidden", !isLogin);
    $("#registerForm").classList.toggle("hidden", isLogin);
  });
});

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#loginError").classList.add("hidden");
  try {
    const data = await api("/users/login", {
      method: "POST",
      auth: false,
      body: {
        email: $("#loginEmail").value.trim(),
        password: $("#loginPassword").value
      }
    });
    setSession(data.token, data.user);
    enterDashboard();
  } catch (err) {
    $("#loginError").textContent = err.message;
    $("#loginError").classList.remove("hidden");
  }
});

$("#registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#registerError").classList.add("hidden");
  try {
    const data = await api("/users/register", {
      method: "POST",
      auth: false,
      body: {
        name: $("#registerName").value.trim(),
        email: $("#registerEmail").value.trim(),
        password: $("#registerPassword").value
      }
    });
    setSession(data.token, data.user);
    enterDashboard();
  } catch (err) {
    $("#registerError").textContent = err.message;
    $("#registerError").classList.remove("hidden");
  }
});

$("#logoutBtn").addEventListener("click", () => {
  clearSession();
  location.reload();
});

// ---------- dashboard nav ----------
$$(".dir-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".dir-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".panel").forEach((p) => p.classList.add("hidden"));
    $(`#panel-${btn.dataset.panel}`).classList.remove("hidden");
    if (btn.dataset.panel === "dispatches") loadPosts();
    if (btn.dataset.panel === "bureaus") loadAccounts();
    if (btn.dataset.panel === "account") loadProfile();
  });
});

async function enterDashboard() {
  $("#authScreen").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");
  $("#userBox").classList.remove("hidden");
  $("#creditsGauge").classList.remove("hidden");
  $("#userName").textContent = state.user.name;
  await refreshCredits();
  loadPosts();
}

// ---------- credits gauge ----------
async function refreshCredits() {
  try {
    const { data } = await api("/users/credits");
    const pct = Math.max(0, Math.min(100, (data.credits / data.monthlyCreditAllowance) * 100));
    const fill = $("#gaugeFill");
    fill.style.width = pct + "%";
    fill.classList.toggle("low", data.credits === 0);
    $("#gaugeText").textContent = `${data.credits} / ${data.monthlyCreditAllowance}`;
  } catch (err) {
    // non-fatal
  }
}

// ---------- compose / generate ----------
$("#generateForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#generateBtn");
  btn.disabled = true;
  btn.textContent = "FILING…";
  try {
    const payload = {
      topic: $("#genTopic").value.trim(),
      platform: $("#genPlatform").value,
      tone: $("#genTone").value.trim(),
      audience: $("#genAudience").value.trim(),
      mediaUrl: $("#genMediaUrl").value.trim() || undefined
    };
    const res = await api("/ai/generate", { method: "POST", body: payload });

    state.lastGeneratedText = res.data;
    state.lastGeneratedMeta = { ...payload, usedFallback: res.usedFallback };

    $("#generatedText").textContent = res.data;
    $("#fallbackBanner").classList.toggle("hidden", !res.usedFallback);
    $("#generateResult").classList.remove("hidden");

    showToast(res.usedFallback ? "Out of credits — used fallback copy." : "Dispatch drafted.", res.usedFallback);
    refreshCredits();
  } catch (err) {
    showToast(err.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "FILE TO WIRE";
  }
});

$("#saveDraftBtn").addEventListener("click", async () => {
  if (!state.lastGeneratedMeta) return;
  try {
    const meta = state.lastGeneratedMeta;
    await api("/posts", {
      method: "POST",
      body: {
        topic: meta.topic,
        platform: meta.platform,
        tone: meta.tone,
        audience: meta.audience,
        mediaUrl: meta.mediaUrl,
        content: $("#generatedText").textContent
      }
    });
    showToast("Saved as draft dispatch.");
    $("#generateResult").classList.add("hidden");
    $("#generateForm").reset();
  } catch (err) {
    showToast(err.message, true);
  }
});

// ---------- dispatches list ----------
function stampFor(post) {
  if (post.status === "published") return `<span class="stamp stamp-published">PUBLISHED</span>`;
  if (post.status === "scheduled") return `<span class="stamp stamp-scheduled">SCHEDULED</span>`;
  return `<span class="stamp stamp-draft">DRAFT</span>`;
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

async function loadPosts() {
  const list = $("#postsList");
  list.innerHTML = `<p class="empty-note">Loading dispatches…</p>`;
  try {
    const { data: posts } = await api("/posts");
    if (!posts.length) {
      list.innerHTML = `<p class="empty-note">No dispatches filed yet. Compose one to get started.</p>`;
      return;
    }
    list.innerHTML = posts.map(renderPostTicket).join("");
    attachPostActions();
  } catch (err) {
    list.innerHTML = `<p class="empty-note">Couldn't load dispatches: ${err.message}</p>`;
  }
}

function renderPostTicket(post) {
  const when = post.status === "published"
    ? `Published ${fmtDate(post.publishedAt)}`
    : post.status === "scheduled"
      ? `Scheduled for ${fmtDate(post.scheduledAt)}`
      : `Saved ${fmtDate(post.createdAt)}`;

  const realStatus = post.status === "published"
    ? (post.postedToRealPlatform
        ? `<p class="post-real-status sent">✓ Actually sent to ${post.platform}</p>`
        : `<p class="post-real-status not-sent">In-app only — didn't reach ${post.platform}${post.externalPostError ? `: ${escapeHtml(post.externalPostError)}` : " (no account connected)"}</p>`)
    : "";

  return `
  <div class="post-ticket" data-id="${post._id}">
    <div class="post-ticket-head">
      <div>
        ${stampFor(post)}
        ${post.usedFallback ? '<span class="stamp stamp-rust" style="margin-left:6px;">FALLBACK</span>' : ""}
      </div>
      <span class="post-platform">${post.platform}</span>
    </div>
    <p class="post-topic">${escapeHtml(post.topic)}</p>
    <p class="post-snippet">${escapeHtml(post.content).slice(0, 220)}${post.content.length > 220 ? "…" : ""}</p>
    <p class="post-when">${when}</p>
    ${realStatus}
    <div class="post-actions">
      ${post.status !== "published" ? `<button class="btn-tiny" data-action="schedule" data-id="${post._id}">Schedule</button>` : ""}
      ${post.status === "draft" ? `<button class="btn-tiny" data-action="publish" data-id="${post._id}" data-platform="${post.platform}" data-media="${post.mediaUrl ? escapeHtml(post.mediaUrl) : ""}">Publish now</button>` : ""}
      <button class="btn-tiny danger" data-action="delete" data-id="${post._id}">Delete</button>
    </div>
  </div>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function attachPostActions() {
  $$('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this dispatch?")) return;
      try {
        await api(`/posts/${btn.dataset.id}`, { method: "DELETE" });
        showToast("Dispatch deleted.");
        loadPosts();
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });

  $$('[data-action="publish"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const body = {};

        // Instagram can't publish text-only — if this post has no
        // mediaUrl saved on it, ask for one now rather than let the
        // publish call fail on the backend.
        if (btn.dataset.platform === "Instagram" && !btn.dataset.media) {
          const url = prompt("Instagram needs an image or video URL for this post (its API has no text-only posts):");
          if (url === null) return; // cancelled
          if (url.trim()) body.mediaUrl = url.trim();
        }

        await api(`/posts/${btn.dataset.id}/publish`, { method: "POST", body });
        showToast("Dispatch published.");
        loadPosts();
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });

  $$('[data-action="schedule"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      state.scheduleTargetId = btn.dataset.id;
      $("#scheduleAt").value = "";
      $("#scheduleAutoRegen").checked = false;
      $("#scheduleModal").classList.remove("hidden");
    });
  });
}

$("#scheduleCancel").addEventListener("click", () => {
  $("#scheduleModal").classList.add("hidden");
});

$("#scheduleForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api(`/posts/${state.scheduleTargetId}/schedule`, {
      method: "POST",
      body: {
        scheduledAt: $("#scheduleAt").value,
        autoRegenerate: $("#scheduleAutoRegen").checked
      }
    });
    showToast("Dispatch scheduled.");
    $("#scheduleModal").classList.add("hidden");
    loadPosts();
  } catch (err) {
    showToast(err.message, true);
  }
});

// ---------- bureaus (connected accounts) ----------

// Real OAuth connect: ask the backend for that platform's consent-screen
// URL (this call carries our auth header), then hand the browser off to
// it directly. The platform redirects back to the backend's own callback
// route when done, which then bounces the browser back here with a
// ?<platform>=connected or ?<platform>=error&reason=... query param —
// handled in handleOAuthRedirect() at the bottom of this file.
$$("[data-oauth]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const platform = btn.dataset.oauth;
    btn.disabled = true;
    try {
      const res = await api(`/social/${platform}/connect`);
      window.location.href = res.data.url;
    } catch (err) {
      showToast(err.message, true);
      btn.disabled = false;
    }
  });
});

$("#connectForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/social/connect", {
      method: "POST",
      body: {
        platform: $("#socPlatform").value,
        username: $("#socUsername").value.trim(),
        platformUserId: $("#socPlatformUserId").value.trim(),
        accessToken: $("#socAccessToken").value.trim()
      }
    });
    showToast("Bureau connected.");
    $("#connectForm").reset();
    loadAccounts();
  } catch (err) {
    showToast(err.message, true);
  }
});

async function loadAccounts() {
  const list = $("#accountsList");
  list.innerHTML = `<p class="empty-note">Loading bureaus…</p>`;
  try {
    const { data: accounts } = await api("/social");
    if (!accounts.length) {
      list.innerHTML = `<p class="empty-note">No accounts connected yet.</p>`;
      return;
    }
    list.innerHTML = accounts.map((a) => `
      <div class="account-row">
        <span><span class="platform">${a.platform}</span>${escapeHtml(a.username)}</span>
        <button class="btn-tiny danger" data-disconnect="${a._id}">Disconnect</button>
      </div>
    `).join("");
    $$("[data-disconnect]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await api(`/social/${btn.dataset.disconnect}`, { method: "DELETE" });
          showToast("Bureau disconnected.");
          loadAccounts();
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });
  } catch (err) {
    list.innerHTML = `<p class="empty-note">Couldn't load bureaus: ${err.message}</p>`;
  }
}

// ---------- account/profile ----------
async function loadProfile() {
  try {
    const { user } = await api("/users/profile");
    $("#profileName").value = user.name;
    $("#profileEmail").value = user.email;
  } catch (err) {
    showToast(err.message, true);
  }
}

$("#profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#profileMsg").classList.add("hidden");
  try {
    const body = {
      name: $("#profileName").value.trim(),
      email: $("#profileEmail").value.trim()
    };
    const pw = $("#profilePassword").value;
    if (pw) body.password = pw;

    const res = await api("/users/profile", { method: "PUT", body });
    state.user = res.user;
    localStorage.setItem("wd_user", JSON.stringify(res.user));
    $("#userName").textContent = res.user.name;
    $("#profilePassword").value = "";
    $("#profileMsg").textContent = "Saved.";
    $("#profileMsg").classList.remove("hidden");
  } catch (err) {
    showToast(err.message, true);
  }
});

// ---------- boot ----------

// After an OAuth connect flow finishes, the backend redirects here with
// ?linkedin=connected / ?x=error&reason=... / etc. Show the result as a
// toast, land on the Bureaus panel so the newly connected account is
// visible, then strip the query string so a refresh doesn't re-show it.
function handleOAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  const platforms = ["linkedin", "x", "instagram"];
  const labels = { linkedin: "LinkedIn", x: "X", instagram: "Instagram" };

  const hit = platforms.find((p) => params.has(p));
  if (!hit) return;

  const result = params.get(hit);
  const reason = params.get("reason");

  if (result === "connected") {
    showToast(`${labels[hit]} connected.`);
  } else {
    showToast(`Couldn't connect ${labels[hit]}${reason ? `: ${decodeURIComponent(reason)}` : "."}`, true);
  }

  if (state.token && state.user) {
    $$(".dir-item").forEach((b) => b.classList.toggle("active", b.dataset.panel === "bureaus"));
    $$(".panel").forEach((p) => p.classList.add("hidden"));
    $("#panel-bureaus").classList.remove("hidden");
    loadAccounts();
  }

  window.history.replaceState({}, document.title, window.location.pathname);
}

if (state.token && state.user) {
  enterDashboard();
  handleOAuthRedirect();
} else {
  handleOAuthRedirect();
}
