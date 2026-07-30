# Prisma Mental Model 🧠

> A guide to **stop memorizing Prisma commands** and start reasoning about them.
> Written against this project: Bun + Express + PostgreSQL + Prisma 7.

If Prisma commands go blank in your head every time, it's because you're trying to
remember them as a *list*. They aren't a list. They're moves between **three things
that must stay in sync**.

---

## Table of contents

- [Fresh setup](#fresh-setup)
- [The three things](#the-three-things)
- [The one question that answers "which command?"](#the-one-question)
- [Why migration files exist](#why-migration-files-exist)
- [The five situations you'll actually be in](#the-five-situations)
- [Why your editor red-squiggles after a schema change](#why-your-editor-red-squiggles)
- [Two commands that confuse everyone](#two-commands-that-confuse-everyone)
- [Project-specific notes](#project-specific-notes)
- [Quick reference](#quick-reference)
- [How to practice](#how-to-practice)

---

<a name="fresh-setup"></a>

## Fresh setup

```bash
bun add -d prisma                              # CLI
bun add @prisma/client @prisma/adapter-pg pg   # runtime client + driver

bunx prisma init --datasource-provider postgresql

# edit .env          → real DATABASE_URL
# edit schema.prisma → generator output + your models

docker compose up -d db                        # database must be running
bunx prisma format
bunx prisma migrate dev --name init            # creates tables + generates client
```

Then create `src/config/prisma.ts` and import it from your app.

---

<a name="the-three-things"></a>

## The three things

```
                  prisma/schema.prisma
                   (what you WANT)
                    /            \
                   /              \
        migrate dev              generate
         db push                     \
             /                        \
            v                          v
    ┌──────────────┐          ┌──────────────────┐
    │  PostgreSQL  │          │ src/generated/   │
    │ (real tables)│          │ prisma (TS types)│
    └──────────────┘          └──────────────────┘
       what EXISTS               what your CODE sees
            \
             \___ db pull ___^ (reverse, rare)
```

`schema.prisma` is the **source of truth**. The database and the generated client are
both *downstream copies* of it. Every Prisma command exists to push a change from the
schema down one of those two arrows.

That's the whole model.

---

<a name="the-one-question"></a>

## The one question that answers "which command?"

> **Which of the three is out of date?**

| Out of date | Command |
| --- | --- |
| Database is behind the schema | `migrate dev` |
| TypeScript types are behind the schema | `generate` |
| Both are behind | `migrate dev` — it runs `generate` for you |

That last row is the thing nobody tells beginners, and it's why the order feels
arbitrary:

> **`migrate dev` = migrate + generate in one command.**

So 90% of the time you run *one* command, not two.

---

## Why migration files exist

This is the part that makes `deploy` vs `dev` finally click.

When you run `migrate dev`, Prisma doesn't just change the database — it writes the
SQL it used into a timestamped folder:

```
prisma/migrations/
├── 20260329065034_init/migration.sql
└── 20260402183921_user_id_uuid/migration.sql
```

Those files get **committed to git**. They're a recipe: *"replay these in order and you
get the correct database."* Prisma also creates a hidden `_prisma_migrations` table
inside your Postgres that records which ones have already run.

So the three migrate commands are really:

| Command | Role |
| --- | --- |
| `migrate dev` | **Author** a new recipe step. Compares schema vs DB, may prompt, may reset data. |
| `migrate deploy` | **Replay** existing recipe steps. Never invents, never prompts, never destroys. |
| `migrate status` | **Report** which steps this database has run so far. |

`migrate deploy` is the one in this project's `Dockerfile` — a container must never
make interactive decisions.

**You write migrations once, on your machine. Every other environment just replays
them.**

---

<a name="the-five-situations"></a>

## The five situations you'll actually be in

### 1. You edited `schema.prisma`

Added a model, a field, an index.

```bash
bunx prisma migrate dev --name add_playlist
```

Done. DB updated, types updated. This is your everyday command.

### 2. You just cloned the repo (or `node_modules` got wiped)

```bash
bun install
bunx prisma migrate deploy   # build the DB from committed recipe files
bunx prisma generate         # build the TS types
```

Both downstream copies are missing, so you rebuild both.

`src/generated/prisma` is **gitignored** — it never comes from git. That's exactly why
`generate` is a separate step on every fresh setup.

### 3. A teammate pushed schema changes and you pulled

```bash
bunx prisma migrate dev
```

No `--name` — you aren't authoring anything. Prisma sees unapplied migration files,
applies them, and regenerates. (`migrate deploy` works too; `dev` also re-syncs your
types.)

### 4. Deploying to production / your container starts

```bash
bunx prisma migrate deploy
```

Only ever this. **Never `migrate dev` in production** — it can prompt, and it can drop
data.

### 5. Everything is broken and you don't care about the data

```bash
bunx prisma migrate reset
```

Drops the DB, replays every migration from scratch, regenerates. Your escape hatch in
development. **Never in production.**

---

<a name="why-your-editor-red-squiggles"></a>

## Why your editor red-squiggles after a schema change

You add `bio String?` to `User`, save, and TypeScript still insists `bio` doesn't
exist.

Nothing is broken. You moved the *left* box (schema), but the *right* box (generated
types) hasn't caught up. `generate` rewrites the actual `.ts` files in
`src/generated/prisma` that `src/config/prisma.ts` imports from. Until it runs, your
code is reading yesterday's types.

If VS Code still caches them after generating:
`Ctrl+Shift+P` → **"TypeScript: Restart TS Server"**.

---

## Two commands that confuse everyone

### `db push`

Pushes the schema to the DB with **no migration file**. Fast, but leaves no history.
It's for throwaway prototyping.

This project has a real migration history, so **avoid it** — mixing `db push` with
`migrate dev` desyncs `_prisma_migrations` and eventually forces a `reset`.

### `db pull`

The **only backwards arrow**. Reads an existing database and rewrites
`schema.prisma` to match. You'd use it exactly once, when adopting Prisma into a
project that already has tables. You'll probably never run it.

---

## Project-specific notes

### Where you run commands matters

From Windows, `.env` sets `DATABASE_URL` to `localhost:5430` — that's the Dockerized
Postgres (`docker-compose.yml` maps host `5430` → container `5432`). So host commands
work fine as long as the `db` container is running:

```bash
docker compose up -d db        # start just the database
bunx prisma migrate dev --name whatever
```

Inside the `app` container, Compose overrides `DATABASE_URL` to
`postgresql://…@db:5432/…` — same database, different vantage point.

### The `--bun` flag

`prisma.config.ts` was generated expecting commands to run as
`bun --bun run prisma <cmd>`. Plain `bunx prisma` usually works, but if you hit a
strange module-resolution error, that's the fallback:

```bash
bun --bun run prisma migrate dev
```

### `DATABASE_URL` is required even for `generate`

`prisma.config.ts` declares `url: env("DATABASE_URL")`, and Prisma refuses to run if
that variable is unset — **even for `generate`, which never touches the database**.
That's why the `Dockerfile` passes a throwaway URL just to get past validation:

```dockerfile
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" bunx prisma generate
```

### No seed script configured

`prisma db seed` needs a `prisma.seed` entry in `package.json` pointing at a seed
script. There isn't one yet — worth adding if you want test users recreated on every
`migrate reset`.

### After a schema change, restart the app container

```bash
bunx prisma format
bunx prisma migrate dev --name add_episode_tags
docker compose restart app
```

The restart is needed because `docker-compose.yml` bind-mounts `.:/src`, so the
container reads your **host-generated** client rather than the one built into the
image.

---

## Quick reference

| Command | What it does | Safe in prod? |
| --- | --- | --- |
| `prisma migrate dev --name x` | Author + apply a migration, then regenerate | ❌ |
| `prisma migrate deploy` | Replay existing migrations only | ✅ |
| `prisma migrate status` | Show applied vs pending migrations | ✅ |
| `prisma migrate reset` | Drop DB, replay all migrations, regenerate | ❌ |
| `prisma generate` | Rebuild the typed client from the schema | ✅ |
| `prisma studio` | Browser GUI to browse/edit rows (`localhost:5555`) | ⚠️ |
| `prisma format` | Auto-format the schema, fix relation syntax | ✅ |
| `prisma validate` | Check the schema for errors, no DB access | ✅ |
| `prisma db push` | Schema → DB with no migration file | ❌ |
| `prisma db pull` | DB → schema (reverse-engineer) | ⚠️ |

---

## How to practice

Do this three or four times and you'll never need a command list again.

1. Add something small to `prisma/schema.prisma` — say `bio String?` on `User`.
2. Run:
   ```bash
   bunx prisma migrate dev --name add_user_bio
   ```
3. **Open the new `prisma/migrations/<timestamp>/migration.sql`.** Seeing
   `ALTER TABLE "User" ADD COLUMN "bio" TEXT;` written by your own command is the
   moment it stops being magic.
4. Run `bunx prisma studio` and watch the column appear.

Repeat with a new model, a relation, and an index. The triangle will become automatic.
