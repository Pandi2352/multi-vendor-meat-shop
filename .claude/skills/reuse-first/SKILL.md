---
name: reuse-first
description: Run at the start of every coding task in this repo. Finds existing helpers, components, DTOs, hooks and config before anything new is written, and decides where new shared code belongs.
---

# Reuse first

## Steps
1. Read `AGENTS.md` golden rules if not already in context.
2. List what the task needs: utils, DTOs, validators, guards, decorators, UI primitives, hooks, formatters, constants, enums, config values.
3. For each need, look it up in `docs/REUSABLE_CHECKLIST.md`, then search the code:
   - Backend: `server/src/common/`, `server/src/database/`, `server/src/infra/`, `server/src/config/`
   - Frontend: `src/components/{ui,form,data,layout,domain}/`, `src/hooks/`, `src/utils/`, `src/lib/`, `src/constants/`
4. Decide per need:
   - **Exists** → import from its barrel (`@common/utils`, `@/components/ui`).
   - **Almost fits** → add an option/variant to the existing item. Do not copy it.
   - **Missing but generic** (could be used by a second feature) → create it in the shared folder first, export from the barrel, add a test if the checklist marks 🧪, tick it in the checklist.
   - **Missing and truly feature-specific** → put it inside the feature folder.
5. Only then write the feature code.

## Where things go
| Kind | Backend | Frontend |
| ---- | ------- | -------- |
| Pure function | `common/utils/<area>.util.ts` | `utils/<area>/<name>.ts` |
| Constant / enum | `common/constants`, `common/enums` | `constants/` (enums from generated API types) |
| Config value | `config/<ns>.config.ts` + `AppConfigService` | `config/app.config.ts` / `config/env.ts` |
| Validation rule | `common/validators` | `utils/validation` (Zod primitives) |
| Cross-cutting HTTP concern | guard / interceptor / filter / pipe in `common/` | `lib/api-interceptors.ts` |
| Visual building block | — | `components/ui` (generic), `components/domain` (meat-shop specific) |
| Stateful logic | service | hook |

## Red flags — stop and refactor
- Writing `toFixed`, `toLocaleString`, `/ 100`, `* 1000` in a component or service → use money/quantity utils.
- Writing `new Types.ObjectId` or `type: Schema.Types.ObjectId` → use UUID string refs.
- Writing `process.env.X` or `import.meta.env.X` outside config.
- A file passing its size limit.
- Styling a raw `<button>`, `<input>`, `<table>` in a feature.
- A second `if (order.status === ...)` chain → use the state machine helper.
