#!/usr/bin/env bash
#
# git-work.sh — one-command "save my progress" for the FridgeAI hackathon team.
#
# What it does, in order:
#   1. Pulls the latest changes for your current branch (rebase, so history stays clean).
#   2. Stages everything you've changed.
#   3. Commits with a message (yours, or an auto-generated one from the changed files).
#   4. Pushes to GitHub, creating the remote branch if it doesn't exist yet.
#   5. Appends one line to TEAM_LOG.md so the whole team can see who did what, when.
#
# Usage:
#   ./scripts/git-work.sh                      # auto-generated commit message
#   ./scripts/git-work.sh "add camera capture" # your own commit message
#
# Safe to run often — if there's nothing to commit, it just says so and exits.

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT_DIR" ]; then
  echo "❌ Not inside a git repository. cd into the project first."
  exit 1
fi
cd "$ROOT_DIR"

BRANCH="$(git branch --show-current)"
if [ -z "$BRANCH" ]; then
  echo "❌ You're in a detached HEAD state. Check out a branch first: git checkout -b your-branch-name"
  exit 1
fi

AUTHOR="$(git config user.name || echo 'unknown')"
if [ "$AUTHOR" = "unknown" ]; then
  echo "⚠️  No git user.name set. Run this once:"
  echo '   git config --global user.name "Your Name"'
  echo '   git config --global user.email "you@example.com"'
  exit 1
fi

TIMESTAMP="$(date '+%Y-%m-%d %H:%M')"
USER_MESSAGE="${1:-}"

if [ -z "$(git status --porcelain)" ]; then
  echo "✅ Nothing to commit — your working tree is already clean."
  exit 0
fi

echo "📥 Pulling latest changes for '$BRANCH'..."
if ! git pull --rebase origin "$BRANCH" 2>/dev/null; then
  echo "ℹ️  No remote branch yet, or nothing to pull — continuing."
fi

# Build a readable file list BEFORE staging, for the auto-generated message and the log.
CHANGED_FILES="$(git status --porcelain | awk '{print $2}')"
FILE_COUNT="$(echo "$CHANGED_FILES" | grep -c . || true)"
SHORT_FILES="$(echo "$CHANGED_FILES" | head -4 | tr '\n' ',' | sed 's/,/, /g' | sed 's/, $//')"
if [ "$FILE_COUNT" -gt 4 ]; then
  SHORT_FILES="$SHORT_FILES, +$((FILE_COUNT - 4)) more"
fi

if [ -n "$USER_MESSAGE" ]; then
  MESSAGE="$USER_MESSAGE"
else
  MESSAGE="Update: $SHORT_FILES"
fi

# Append the log entry now, so it's part of the same commit as the work itself.
LOG_FILE="TEAM_LOG.md"
if [ ! -f "$LOG_FILE" ]; then
  {
    echo "# Team Log"
    echo ""
    echo "Auto-updated by \`scripts/git-work.sh\`. Don't edit by hand — just run the script."
    echo ""
    echo "| Time | Author | Branch | Files changed | Message |"
    echo "|---|---|---|---|---|"
  } > "$LOG_FILE"
fi
echo "| $TIMESTAMP | $AUTHOR | $BRANCH | $FILE_COUNT | $MESSAGE |" >> "$LOG_FILE"

git add -A
git commit -m "$MESSAGE"

echo "📤 Pushing to origin/$BRANCH..."
git push -u origin "$BRANCH"

echo ""
echo "✅ Done. Pushed $FILE_COUNT file(s) to '$BRANCH' and logged it in $LOG_FILE."
