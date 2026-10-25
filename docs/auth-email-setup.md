# Auth email setup (self-hosted Supabase)

RankRiot signs users in with a **6-digit email OTP**. Both a brand-new user and
a returning user land on the same "enter your code" screen, so **every auth
email must contain the code** (`{{ .Token }}`). A link-only email leaves new
users unable to finish signing in — that was the production bug this setup
fixes.

There are two ways the email can be produced. Only one is active at a time;
both are now correct, so either works:

1. **GoTrue built-in templates** — GoTrue renders the HTML templates below and
   sends via its configured SMTP/Resend. This is the default and what the env
   vars in this doc configure.
2. **Custom `send_email` hook** — if the GoTrue "send email" hook is enabled
   (`GOTRUE_HOOK_SEND_EMAIL_ENABLED=true`, pointing at
   `/api/auth/send-email`), GoTrue hands the email to that route instead and
   the built-in templates are **not** used. That route (`src/app/api/auth/
   send-email/route.ts`) renders its own HTML via Resend and now includes the
   code in the signup path too. If the hook is on, the template env vars below
   are ignored — but setting them anyway is harmless and a safe fallback.

---

## 1. Frontend env (Coolify — build time)

`NEXT_PUBLIC_SITE_URL` is the canonical public URL of the app. It is read by
`getSiteUrl()` (`src/lib/site-url.ts`) and used for `emailRedirectTo` and the
OAuth callback. It is a **build-time** `NEXT_PUBLIC_*` var, so it must be set in
Coolify **before** the build.

| Var | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://rankriot.app` |

`NEXT_PUBLIC_BASE_URL` (the older name, already set in production) is used as a
fallback if `NEXT_PUBLIC_SITE_URL` is unset, so nothing breaks if only the old
one is present — but set `NEXT_PUBLIC_SITE_URL` to make it canonical.

---

## 2. Supabase (GoTrue) env

Set these in the self-hosted Supabase `.env` (names as they appear in the
standard Supabase self-hosted compose; the `GOTRUE_*` equivalent is in
parentheses where it differs):

| Var | Value |
|---|---|
| `SITE_URL` (`GOTRUE_SITE_URL`) | `https://rankriot.app` |
| `ADDITIONAL_REDIRECT_URLS` (`GOTRUE_URI_ALLOW_LIST`) | `https://rankriot.app/auth/confirm,https://rankriot.app/api/auth/callback` |
| `GOTRUE_MAILER_TEMPLATES_CONFIRMATION` | `https://rankriot.app/email-templates/confirmation.html` |
| `GOTRUE_MAILER_TEMPLATES_MAGIC_LINK` | `https://rankriot.app/email-templates/magic-link.html` |
| `GOTRUE_MAILER_SUBJECTS_CONFIRMATION` | `Your RankRiot sign-in code` |
| `GOTRUE_MAILER_SUBJECTS_MAGIC_LINK` | `Your RankRiot sign-in code` |

Notes:
- `SITE_URL` is the fallback redirect base. It must be the **app** host
  (`https://rankriot.app`), not the Supabase/API host. It falling back to
  `https://supabase.rankriot.app` is what sent confirmation links to the wrong
  place; the app now also passes `emailRedirectTo` explicitly so it no longer
  depends on this, but set it correctly anyway.
- `ADDITIONAL_REDIRECT_URLS` must include `/auth/confirm` (OTP/magic link) and
  `/api/auth/callback` (Google OAuth), or GoTrue will refuse those redirects.
- The other mailer templates (recovery, invite, email_change) exist in
  `public/email-templates/` and can be wired up the same way if those flows are
  used; they are not part of OTP sign-in.

---

## 3. Where the template files live / are hosted

The templates ship with the frontend in `public/email-templates/` and are
served as static files at `https://rankriot.app/email-templates/<name>.html`
once deployed. GoTrue fetches them by URL at send time, so no separate hosting
is needed — just the deploy. If you prefer to host them elsewhere (CDN/bucket),
point the `GOTRUE_MAILER_TEMPLATES_*` URLs there instead.

Template variables used:

| Variable | Meaning |
|---|---|
| `{{ .Token }}` | the 6-digit code (primary) |
| `{{ .TokenHash }}` | hash for the fallback confirm link |
| `{{ .SiteURL }}` | the `SITE_URL` above |
| `{{ .ConfirmationURL }}` | GoTrue's pre-built confirm link (not relied on) |

The fallback link in each template is
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<signup|magiclink>`,
which `/auth/confirm` verifies server-side.

---

## 4. Resend: tracking must be OFF

If email is sent through Resend (built-in mailer SMTP **or** the custom hook),
turn **Click tracking and Open tracking OFF** for the sending domain:

> Resend dashboard → Domains → `rankriot.app` → **Click tracking: Off**,
> **Open tracking: Off**.

With click tracking on, Resend rewrites every link (including the
`/auth/confirm?token_hash=...` fallback) through its tracking domain, which
breaks token verification and leaks the one-time token to the tracker. The
6-digit code still works, but the fallback link would not.

---

## 5. Verify both paths after changing config

1. **New user:** sign in with an email that has never been used → the email
   must show a **6-digit code** (not just a link). Enter it → lands on
   `/overview`.
2. **Returning user:** sign in with an existing account → 6-digit code → enter
   it → lands on `/overview`.
3. **Fallback link:** click the "confirm directly" link in either email → it
   should sign you in via `/auth/confirm` and land on `/overview`.
4. **Google OAuth:** sign in with Google → returns via `/api/auth/callback`.
