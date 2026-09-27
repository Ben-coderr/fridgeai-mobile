# Team Git Workflow — FridgeAI

One-time setup and the day-of workflow. Read this once, then just use `git-work.sh`.

## One-time setup (everyone, before the event)

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

This name is what shows up in `TEAM_LOG.md` and in GitHub's history, so use your real name, not a nickname only you recognize.

Clone the repo, enter its root, install only the workspace you need, and check out your own branch instead of working on `main`:

```bash
git clone <repo-url>
cd <repo-folder>
git switch -c feature/<what-you're-building>
```

Examples: `feature/mobile-scanning`, `feature/mobile-ingredients`, `feature/backend-vision`.

Before editing, claim the files or feature area in your team chat. Do not have two people change the same screen, API route, or shared type at once.

## Whenever you've made progress

Just run:

```bash
./scripts/git-work.sh "Add editable detected ingredients"
```

Or, if you're using **Claude Code** in this repo, just tell it: **"do git work"** — it reads `CLAUDE.md` and does the same thing, writing the commit message for you.

That one command stages the current workspace changes, commits them, pushes the current feature branch, and logs the result in `TEAM_LOG.md`. Review `git status` first: it intentionally commits every changed file in this repository.

Run it often — every 20–30 minutes, or whenever you finish a small piece — rather than saving up a giant change. Small, frequent commits are much easier to merge and to undo if something breaks.

## Merging your branch into `main`

Once your feature works and its workspace checks pass, open a pull request on GitHub from your feature branch into `main`. A teammate reviews the diff, then the assigned Git point person merges it. This keeps `main` protected and gives the team a clear rollback point.

```bash
npm --prefix mobile run lint
npm --prefix mobile exec tsc --noEmit
```

For backend work, run `npm run build` inside `backend/`. If GitHub shows conflicts you're not sure how to resolve, ask the Git point person rather than guessing.

## Windows users

Run these commands in **Git Bash** (installed automatically with Git for Windows), not PowerShell/CMD — `git-work.sh` is a bash script.

## If something goes wrong

- **"failed to push"** → run `git pull --rebase origin <branch>`, resolve conflicts, run the appropriate checks, then retry the script.
- **Accidentally committed a real API key** → tell the team immediately and rotate/regenerate that key. Removing it from one commit doesn't remove it from git history.
- **Not sure what state your branch is in** → `git status` always tells you.
