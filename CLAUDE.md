# Project instructions for Claude Code

This file is read automatically by Claude Code when working in this repo. It applies to every teammate using it here.

## The "do git work" command

When the person says anything like **"do git work"**, **"push my work"**, **"save my progress"**, **"commit this"**, or similar — do the following, without asking for confirmation first:

1. Run `git status` and `git diff` to see what changed.
2. Write a short, specific commit message in the imperative mood (e.g. "Add camera capture to home screen", not "Added" or "Updates"). Base it on the actual diff, not a generic placeholder.
3. Run `./scripts/git-work.sh "<your commit message>"` from the repository root.
4. Report back concisely: which branch it pushed to, how many files, and the commit message used. If the script fails (e.g. merge conflict from `git pull --rebase`), stop and explain the conflict in plain terms — do not try to force-push or discard anyone's changes.

Do not run this automatically without being asked — only when the person explicitly asks you to save/push/commit their work.

## Branching (keep it simple)

- `main` should always run. Do not push feature work straight to `main`; use a feature branch and a pull request.
- Branch naming: `feature/<short-name>`, e.g. `feature/scanning-screen`, `feature/shopping-list`.
- Merge feature branches into `main` frequently (every 30–60 min is reasonable for a one-day build) rather than sitting on a big diff — smaller merges mean smaller conflicts.
- If two people are editing the same file at the same time, coordinate before either one commits — it avoids most conflicts before they happen.

## Commit messages

Imperative, short, specific: `Add missing-ingredient badge to recipe card`, not `updates` or `fix stuff`. The team log (`TEAM_LOG.md`) is only as useful as the messages that feed it.

## What NOT to commit

- Never commit `.env`, `.env.local`, or any file containing a real API key. `.gitignore` already excludes these — don't override that.
- Don't commit `node_modules/`, `.next/`, `.expo/`, or `dist/` — also already ignored.
