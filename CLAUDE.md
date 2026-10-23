@AGENTS.md

## Claude Code notes
- Skills are in `.claude/skills/`. After editing one, run `bash scripts/sync-agent-skills.sh` so Antigravity gets the same copy.
- Start every coding task with the `reuse-first` skill.
- Use the `package-install` skill before any `npm install`, upgrade or scaffolding CLI.
- Run `bash scripts/check-rules.sh` before reporting a task as done.
