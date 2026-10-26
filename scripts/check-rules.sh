#!/usr/bin/env bash
# Fails when code breaks the AGENTS.md golden rules.
# Usage: bash scripts/check-rules.sh

set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

MAX_LINES=250
FAILED=0

FRONTEND_DIRS=()
for d in public/src admin/src; do [ -d "$d" ] && FRONTEND_DIRS+=("$d"); done
BACKEND_DIR=""
[ -d server/src ] && BACKEND_DIR="server/src"

# Drops grep hits whose matched line is a comment (//, /*, * ...), so docs can mention banned words.
skip_comments() {
  grep -vE '^[^:]+:[0-9]+:[[:space:]]*(//|/\*|\*)'
}

report() {
  local title="$1" output="$2"
  if [ -n "$output" ]; then
    echo "✗ $title"
    echo "$output" | sed 's/^/    /'
    FAILED=1
  fi
}

if [ ${#FRONTEND_DIRS[@]} -gt 0 ]; then
  report "Shadow utilities are not allowed" "$(
    grep -rnoE '(^|[[:space:]"'\''`:])(drop-|inset-|text-)?shadow(-[][a-z0-9/.-]+)?' \
      --include='*.ts' --include='*.tsx' --include='*.css' "${FRONTEND_DIRS[@]}" \
      | grep -v 'styles/theme.css'
  )"

  report "Only rounded-md (and rounded-full for avatars/dots) is allowed" "$(
    grep -rnoE '\brounded(-[a-z0-9]+)*' \
      --include='*.ts' --include='*.tsx' --include='*.css' "${FRONTEND_DIRS[@]}" \
      | grep -v 'styles/theme.css' \
      | grep -vE ':rounded(-(t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee))?-(md|full|none)$'
  )"

  report "import.meta.env is only allowed in src/config/env.ts" "$(
    grep -rn 'import\.meta\.env' --include='*.ts' --include='*.tsx' "${FRONTEND_DIRS[@]}" \
      | grep -v 'src/config/env.ts' | grep -v 'vite-env.d.ts'
  )"

  report "Raw console.log is not allowed (use lib/logger)" "$(
    grep -rn 'console\.log' --include='*.ts' --include='*.tsx' "${FRONTEND_DIRS[@]}" \
      | grep -v 'src/lib/logger.ts'
  )"
fi

if [ -n "$BACKEND_DIR" ]; then
  report "ObjectId is not allowed — use UUID v7 strings" "$(
    grep -rnE 'ObjectId' --include='*.ts' "$BACKEND_DIR" | skip_comments
  )"

  report "process.env is only allowed in server/src/config" "$(
    grep -rn 'process\.env' --include='*.ts' "$BACKEND_DIR" | grep -v "$BACKEND_DIR/config/" | grep -v "$BACKEND_DIR/database/seeds/" | skip_comments
  )"

  report "Raw console.log is not allowed (use the Pino logger)" "$(
    grep -rn 'console\.log' --include='*.ts' "$BACKEND_DIR" | grep -v "$BACKEND_DIR/database/seeds/" | skip_comments
  )"
fi

SRC_DIRS=("${FRONTEND_DIRS[@]}")
[ -n "$BACKEND_DIR" ] && SRC_DIRS+=("$BACKEND_DIR")
if [ ${#SRC_DIRS[@]} -gt 0 ]; then
  report "Files over $MAX_LINES lines — split them" "$(
    find "${SRC_DIRS[@]}" -type f \( -name '*.ts' -o -name '*.tsx' \) \
      ! -name '*.generated.ts' ! -name '*.spec.ts' ! -name '*.test.ts' ! -name '*.test.tsx' \
      ! -path '*/seeds/*' \
      -exec awk -v max="$MAX_LINES" 'END { if (NR > max) print FILENAME ": " NR " lines" }' {} \;
  )"
fi

if [ "$FAILED" -eq 0 ]; then
  echo "✓ All project rules pass"
fi
exit "$FAILED"
