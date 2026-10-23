---
trigger: always_on
---

# Project rules (Antigravity)

The full rules live in `AGENTS.md` at the repository root. Read it before every task and follow it exactly.

Short version:
- Reuse first: check `docs/REUSABLE_CHECKLIST.md` and existing `common/`, `components/ui/`, `utils/`, `hooks/` before writing code.
- Small files, one export per file, thin controllers and pages.
- UI: `rounded-md` everywhere (`rounded-full` only for avatars/dots/spinners). No shadows of any kind. Theme tokens only.
- Backend: UUID v7 string ids, never ObjectId. No `process.env` outside `server/src/config`. Money in paise, weight in grams, integers only.
- Packages: newest stable version compatible with the system Node (`.nvmrc`), resolved via `node scripts/check-pkg.mjs <pkg>` (see the `package-install` skill). Never use versions from memory.
- Run `bash scripts/check-rules.sh` before finishing.

Skills are in `.agent/skills/` (mirrored from `.claude/skills/` — do not edit the mirror directly).
