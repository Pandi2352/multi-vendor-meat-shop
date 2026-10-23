#!/usr/bin/env bash
# Mirrors .claude/skills (source of truth) into .agent/skills for Antigravity.
# Usage: bash scripts/sync-agent-skills.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/.claude/skills"
DEST="$ROOT/.agent/skills"

rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$SRC"/. "$DEST"/

echo "Synced $(find "$DEST" -name SKILL.md | wc -l | tr -d ' ') skills to .agent/skills"
