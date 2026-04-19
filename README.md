# NoteSpace — AI-Assisted Next.js Portfolio Project

> A production-grade note-taking web application built in **5 days** using **Claude Code** as a primary development partner. This project demonstrates how AI-assisted development, when structured correctly, delivers production-ready code with consistent quality, full test coverage, and zero shortcuts.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![Bun](https://img.shields.io/badge/Bun-1.3-f9f1e1?logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)
![SQLite](https://img.shields.io/badge/SQLite-WAL-003b57?logo=sqlite)
![Vitest](https://img.shields.io/badge/Vitest-4.1-6e9f18?logo=vitest)

**GitHub:** https://github.com/LigeshK/Claude_Code_demo

---

## 🚀 Project Overview

NoteSpace is an authenticated rich-text note-taking application where users can create, edit, delete, and publicly share notes via unique URLs. It was built from a blank repository to a fully tested, production-ready state in 5 days using **Claude Code** as the primary development accelerator.

The project serves as a real-world demonstration of how Claude Code's advanced features — Plan Mode, custom Skills, sub-agents, MCP integrations, and post-tool hooks — transform AI assistance from a code-completion tool into a structured engineering partner.

**Core user flows:**
- Sign up / sign in with email and password
- Create and edit rich-text notes (TipTap editor with auto-save)
- Toggle public sharing — generates a permanent `/p/[slug]` link anyone can view
- Delete notes with confirmation

---

## ✨ Features

### Authentication
- Email/password sign-up and sign-in via **better-auth**
- Session cookies with server-side validation
- `requireAuth()` guard on all protected pages and API routes — redirects to `/login` if unauthenticated
- Unified login/register UI at `/login?mode=register`

### Notes CRUD
- Create notes with a title and rich-text body
- All queries are scoped to `user_id` — no cross-user data leakage possible at the SQL level
- List view on `/dashboard` shows title, last updated, and public status
- Full edit history preserved via `updated_at` timestamps

### Rich Text Editing
- **TipTap v3** with StarterKit: headings (H1–H3), bold, italic, bullet lists, inline code, code blocks, horizontal rule
- **Auto-save:** debounced 1000ms after every keystroke — no save button required
- **Keepalive on unmount:** a final save fires with `keepalive: true` when navigating away, preventing data loss
- Content stored as `JSON.stringify(editor.getJSON())` — structurally safe, never raw HTML

### Public Sharing
- Toggle sharing via `POST /api/notes/[id]/share`
- First share generates a **nanoid(16)** slug — persisted permanently, reused on re-enable
- Public viewer at `/p/[slug]` — no authentication required, TipTap read-only mode
- ShareToggle component shows the full URL and a one-click copy button

### Security
- **No XSS risk:** content flows through TipTap's own renderer (`NoteRenderer.tsx`), never `dangerouslySetInnerHTML`
- All authenticated API routes return `401` before touching any data if session is missing
- `user_id` filter on every SQL query — even if an ID is guessed, data is not accessible
- Public slugs use 16-char nanoid — ~10^28 combinations, not enumerable

### Performance
- TipTap editor is **dynamically imported** (no SSR) — prevents hydration issues and reduces initial bundle
- `GET /api/notes` omits `content_json` — only metadata in the list response, full content fetched on open
- SQLite **WAL mode** for concurrent read performance; indexes on `user_id`, `public_slug`, `is_public`
- `busy_timeout = 5000ms` prevents write contention errors under load

### Testing
- **Vitest v4** with Node environment
- 4 test files, ~700 lines of test code covering every layer:
  - `lib/__tests__/notes.test.ts` — repository unit tests (createNote, getById, update, delete, share, public slug)
  - `app/api/notes/__tests__/route.test.ts` — GET list + POST create, auth checks, response shapes
  - `app/api/notes/[id]/__tests__/route.test.ts` — GET, PUT, DELETE, 404 handling
  - `app/api/notes/[id]/share/__tests__/route.test.ts` — toggle on/off, bad request, not-found
- `test-utils.ts` provides `makeNote()`, `makeRawNote()`, `makeSession()` factories for clean test setup

---

## 🏗️ Architecture & Tech Stack

### Layer Breakdown

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Pages & Server Components | `app/` | Data fetching, auth guards, SSR |
| API Route Handlers | `app/api/` | REST JSON endpoints, session validation |
| Repository | `lib/notes.ts` | Note CRUD with raw SQL; always filters by `user_id` |
| DB Helper | `lib/db.ts` | Singleton Bun SQLite connection; exports `query<T>`, `get<T>`, `run` |
| Components | `components/` | UI — `NoteList`, `NoteEditor`, `ShareToggle`, `DeleteNoteButton`, `PublicNoteViewer` |

### Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Landing page with sign-in/sign-up CTAs |
| `/login` | Public | Email/password auth (`?mode=register` for sign-up) |
| `/dashboard` | Required | Note list + new note button |
| `/notes/new` | Required | Create note via server action |
| `/notes/[id]` | Required | Read-only view with share toggle and delete |
| `/notes/[id]/edit` | Required | Full TipTap editor with auto-save |
| `/p/[slug]` | Public | Read-only public note viewer |

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notes` | ✅ | List user's notes (no content_json) |
| POST | `/api/notes` | ✅ | Create new note |
| GET | `/api/notes/[id]` | ✅ | Full note with content |
| PUT | `/api/notes/[id]` | ✅ | Update title and/or content |
| DELETE | `/api/notes/[id]` | ✅ | Hard delete |
| POST | `/api/notes/[id]/share` | ✅ | Toggle public sharing |
| GET | `/p/[slug]` | ❌ | Public note viewer (server-rendered) |

### Database Schema (`notes` table)

```sql
CREATE TABLE notes (
  id          TEXT PRIMARY KEY,           -- nanoid
  user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Untitled note',
  content_json TEXT NOT NULL DEFAULT '{}',  -- TipTap JSON
  is_public   INTEGER NOT NULL DEFAULT 0,
  public_slug TEXT UNIQUE,               -- nanoid(16), generated on first share
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

### Tech Stack

| Concern | Technology | Version |
|---------|-----------|---------|
| Framework | Next.js App Router | 16.1.1 |
| Runtime | Bun | 1.3+ |
| Language | TypeScript | 5 |
| Styling | TailwindCSS | v4 |
| Database | SQLite via Bun built-in | — |
| Auth | better-auth | 1.6.2 |
| Rich text | TipTap + StarterKit | 3.22.3 |
| Testing | Vitest | 4.1.4 |
| Formatting | oxfmt | 0.45.0 |
| Validation | Zod | 4.3.6 |
| Icons | lucide-react | 1.8.0 |

---

## 🤖 How Claude Code Was Used

This is the core of the project story. Claude Code was not used as a tab-completion tool — it was configured as an **opinionated engineering partner** with domain knowledge, quality standards, and automation built in from day one.

### a) Specification-First Development

Before any feature code was written, two foundational files were committed together (commit `12bcc77`):

- **`SPEC.MD`** (572 lines) — full technical specification including data model, API contracts, component specs, and implementation order
- **`CLAUDE.md`** (67 lines) — architectural guide telling Claude Code which patterns to follow, what security rules are non-negotiable, and how the layers relate

This front-loaded intent capture is what separates structured AI-assisted development from "vibe coding." Claude Code generated every subsequent file with full awareness of the intended architecture.

### b) Plan Mode for Structured Implementation

Commit `512b90e` is titled **"Leveraging Plan mode on"** — the route scaffolding was done entirely under Claude Code's Plan Mode. This means:

1. Claude proposed the full route structure before writing any code
2. The developer reviewed and approved the approach
3. Only then did Claude generate the actual files

Plan Mode prevented mid-implementation pivots and ensured the route design was validated against `SPEC.MD` before any code was committed.

### c) Custom Skills System (8 Domain Skills)

Commit `55dee80` added `.claude/skills/` with 8 custom skill modules — essentially an always-on code review layer baked into every generation:

| Skill | Purpose |
|-------|---------|
| `bun-first` | Prefer Bun APIs over Node.js equivalents |
| `clean-typescript` | Strict typing, no `any`, consistent patterns |
| `modern-accessible-html-jsx` | Semantic HTML, ARIA, accessibility by default |
| `modern-best-practice-nextjs` | App Router patterns, Server Components, no legacy pages/ |
| `modern-best-practice-react-components` | No unnecessary state/useEffect; includes a 765-line `you-dont-need-useeffect` reference |
| `modern-browser-apis` | Use native APIs before reaching for libraries |
| `modern-tailwind` | TailwindCSS v4 utilities and variant patterns |
| `web-security` | XSS, injection, auth guard patterns |

Every component, API route, and utility generated after this commit was automatically subject to these standards — no separate code review step required.

### d) Custom Sub-Agent for Documentation

Commit `2d65b27` created `.claude/agents/DocsExplorer.md` — a specialized Claude sub-agent configured with `WebSearch`, `WebFetch`, and `MCPSearch` tools running on the Sonnet model.

When implementation required library documentation (better-auth session helpers, TipTap JSON API, Next.js App Router patterns), the main conversation delegated to DocsExplorer instead of inline searching. This kept the main context window clean and returned structured documentation summaries rather than raw web content.

### e) MCP Integration (Context7)

Commit `2c0e272` connected the **Context7 MCP server** to the project. Context7 provides current, version-accurate documentation for libraries — critical when working with:

- `better-auth` v1.6 (relatively new library, sparse training data)
- TipTap v3 (API changed significantly from v2)
- Next.js App Router (evolved rapidly post-13.4)
- Bun's built-in SQLite client

Without MCP, Claude Code would have generated code against stale training data — a common failure mode with fast-moving JS libraries. With Context7, every API call was validated against the actual current docs.

### f) Batch Code Generation with Consistent Patterns

Two commits demonstrate the scale of batch generation:

- **Commit `55dee80`:** 38 files, 2,097 insertions in a single pass — all components (`NoteList`, `NoteEditor`, `ShareToggle`, `DeleteNoteButton`, `auth-form`, `AppHeader`), all API routes, `lib/notes.ts`, `lib/db.ts` — all generated with consistent naming, typing, and error handling patterns

- **Commit `c216cfd`:** 5 test files totalling 823 lines generated in one pass — unit tests, API integration tests, and shared test utilities, all following the same mock factory pattern

The consistency across these files is not coincidental — it's the direct result of Skills enforcing patterns at generation time.

### g) Post-Tool Hooks for Zero-Cost Formatting

Commit `6c00b4d` added a `PostToolUse` hook to `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "oxfmt --write $CLAUDE_TOOL_INPUT_FILE" }]
    }]
  }
}
```

Every time Claude Code wrote or edited a file, `oxfmt` ran automatically. The result: a 41-file formatting pass in commit `6c00b4d` with zero developer effort — single-quote normalization, consistent spacing, and import ordering applied uniformly across the entire codebase.

### h) Iterative Refactoring

Commit `6c11bef` is a 24-file refactoring pass: component extraction into separate files, server actions added to `app/notes/new/actions.ts`, client wrapper components (`NoteEditorClient.tsx`, `NewNoteFormClient.tsx`) extracted for clean dynamic import boundaries.

This demonstrates Claude Code operating as a senior engineer would — not just generating first-pass code, but revisiting and improving architecture based on emerging patterns.

---

## 📈 Development Journey

The entire project was built between April 15–19, 2026 — 5 calendar days from blank repo to tested, production-ready application.

| Date | Commit | Milestone | Deliverable |
|------|--------|-----------|-------------|
| Apr 15 | `53320ef` | Project kickoff | Initial Next.js scaffold |
| Apr 15 | `12bcc77` | Intent locked | SPEC.MD (572 lines), CLAUDE.md, all config files |
| Apr 16 | `512b90e` | Architecture | Plan Mode on; all route stubs created |
| Apr 17 | `2c0e272` | Backend foundation | better-auth, Bun SQLite, DB schema, `lib/db.ts` |
| Apr 17 | `2d65b27` | DX tooling | DocsExplorer sub-agent created |
| Apr 17 | `55dee80` | Quality system + Core app | 8 skills + 38-file component/API/repo generation |
| Apr 18 | `6c11bef` | Refactor | 24-file component extraction, server actions |
| Apr 18 | `fe7d401` | CRUD complete | Notes add/edit/delete fully wired end-to-end |
| Apr 19 | `6c00b4d` | Polish + Public sharing | Post-tool hooks, `/p/[slug]` public viewer, 41-file format pass |
| Apr 19 | `c216cfd` | Test coverage | Vitest suite, 4 files, all API routes + repository covered |

**Key observation:** The project follows a deliberate sequence — spec → architecture → backend → quality system → features → refactor → polish → tests. This is not accidental; it's the result of Plan Mode enforcing a coherent build order.

---

## ⚡ Impact & Productivity Gains

| Metric | With Claude Code | Traditional Estimate |
|--------|-----------------|---------------------|
| Time to production-ready app | **5 days** | 3–4 weeks |
| Source files with consistent patterns | ~35 files | Requires dedicated code review cycles |
| Formatting overhead | **Zero** (automated hooks) | Manual or CI-enforced |
| Library API accuracy | **High** (Context7 MCP) | Risk of stale training data |
| Test coverage setup | Same session as feature code | Usually deferred to later sprint |
| Architecture documentation | Written before code (SPEC.MD) | Often written after the fact |

**Specific wins:**

- **No formatting reviews** — `oxfmt` hook ran on every file write; PRs had zero style comments
- **No library version drift** — Context7 ensured better-auth and TipTap v3 APIs were used correctly on the first pass
- **Consistent component structure** — Skills enforced patterns that would otherwise require a style guide + reviewer enforcement
- **Sub-agent context isolation** — documentation research never polluted the main implementation context, keeping responses precise
- **Plan Mode alignment** — zero cases of "this isn't what I wanted" mid-implementation because intent was validated first

---

## 🧠 Key Learnings & Best Practices

**Write SPEC.MD and CLAUDE.md before any code.** Claude Code generates dramatically better output when it has explicit architectural intent to work against. A 572-line spec is not over-engineering — it's the difference between generating correct first-draft code and generating plausible-looking code that doesn't match your actual data model.

**Custom Skills > prompt engineering.** Repeating quality requirements in every prompt is fragile and inconsistent. Encoding them as Skills means every generation is subject to the same standards — automatically, invisibly, every time.

**Sub-agents for documentation keep the main thread lean.** When Claude fetches docs inline, the conversation fills with raw library content. A dedicated DocsExplorer agent returns a structured summary and leaves the main context clean for implementation reasoning.

**Post-tool hooks eliminate entire review categories.** If formatting is automated, it never needs to be reviewed. Hooks are underutilized — anything deterministic (formatting, linting, import sorting) belongs there, not in CI.

**Plan Mode is for alignment, not planning.** Its value isn't that it produces a plan — it's that it creates a checkpoint where you confirm the plan before any code is written. The asymmetry of cost (a 2-minute review vs. a major refactor) makes it worthwhile on every non-trivial task.

**Bun + SQLite is a serious stack.** The `bun:sqlite` built-in client with WAL mode handled the entire data layer without a single npm dependency. For applications that don't need horizontal scaling, this eliminates an entire infrastructure category.

---

## ▶️ Setup & Run

**Prerequisites:** [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)

```bash
# Clone
git clone https://github.com/LigeshK/Claude_Code_demo
cd Claude_Code_demo

# Install dependencies
bun install

# Configure environment
cp .env.example .env.local
# Edit .env.local:
#   BETTER_AUTH_SECRET=<32+ character random string>
#   DB_PATH=data/app.db

# Start development server
bun run dev
# → http://localhost:3000

# Run tests
bun run test

# Production build
bun run build
bun start
```

**Available scripts:**

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Next.js dev server with hot reload |
| `bun run build` | Build production bundle |
| `bun start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run test` | Run Vitest test suite |
| `bun run test:watch` | Run tests in watch mode |

---

*Built by Ligesh Koshy as a demonstration of Claude Code-accelerated development. All architectural decisions, code patterns, and features are traceable to real commits in this repository.*
