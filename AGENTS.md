# AGENTS.md — Tamil Nadu Meat Marketplace

Single source of truth for every AI agent (Claude Code, Antigravity, others).
Read this file fully before writing code. Then read the skill that matches your task.

## Repository layout

| Folder    | App                        | Stack                                          |
| --------- | -------------------------- | ---------------------------------------------- |
| `server/` | REST API                   | NestJS, MongoDB (Mongoose), Swagger, TypeScript |
| `public/` | Customer storefront        | React, Vite, TypeScript, Tailwind CSS v4       |
| `admin/`  | Admin + Vendor + Delivery  | React, Vite, TypeScript, Tailwind CSS v4       |
| `docs/`   | Plan, checklist, decisions | Markdown                                       |

Key docs:
- `docs/PROJECT_PLAN.md` — product scope, modules, collections, order lifecycle, roadmap.
- `docs/REUSABLE_CHECKLIST.md` — every shared helper, config, component and pattern. **Check it before writing anything.**

## Golden rules (non-negotiable)

### 1. Reuse first
- Before writing a function, component, hook, DTO, guard or constant, search `docs/REUSABLE_CHECKLIST.md` and the `common/`, `shared/`, `components/ui/`, `utils/`, `hooks/` folders.
- If it exists, use it. If it almost fits, extend it with an option. Do not fork a copy.
- If you write the same logic a second time, extract it into the shared location and tick it in the checklist.
- New shared item → add it to `docs/REUSABLE_CHECKLIST.md` in the same change.

### 2. Small files, one job each
- One class / component / hook per file. File name = export name in kebab-case.
- Soft limits: React component 150 lines, hook 100, NestJS service 250, controller 150, util file 150. Over the limit → split.
- Controllers and pages are thin: no business logic. Logic lives in services (backend) and hooks/feature services (frontend).
- Every folder with public exports has an `index.ts` barrel. Import from the barrel, not deep paths.

### 3. UI rules
- Radius: **`rounded-md` everywhere.** Only exception: `rounded-full` for avatars, status dots, spinners. Never `rounded`, `rounded-sm`, `rounded-lg`, `rounded-xl`, `rounded-2xl`.
- **No shadows.** Never `shadow-*`, `drop-shadow-*`, `inset-shadow-*`, `text-shadow-*`. Separate surfaces with `border border-border` and background tokens.
- Colors only through theme tokens (`bg-surface`, `text-muted`, `border-border`, `bg-primary`). No raw hex, no `bg-red-500` in feature code.
- Pages compose primitives from `components/ui` and `components/layout`. A feature never styles a raw `<button>` or `<input>`.
- Variants via `cva`, class merging via `cn()`. No string concatenation of classes.
- Enforced by the Tailwind theme (radius/shadow namespaces cleared) and `scripts/check-rules.sh`.

### 4. Backend rules
- **ESM project (NestJS 12 is ESM-only).** Relative imports end in `.js` (`'./money.util.js'`). Cross-folder imports use the `package.json#imports` aliases: `#config`, `#database`, `#bootstrap`, `#common/<folder>` (e.g. `#common/utils`), `#infra/<folder>`, `#modules/<name>`. Never `../../`.
- **IDs are UUID v7 strings. Never `ObjectId`, never `Types.ObjectId`, never `SchemaTypes.ObjectId`.** Every schema extends `BaseEntity` (`_id: string`, default `generateId()`). References are `type: String` with `ref`.
- Route params with ids use `ParseUUIDPipe` (or the `@UuidParam()` decorator). DTO ids use `@IsUUID('7')`.
- **No `process.env` outside `server/src/config/`.** Read config through the typed `AppConfigService`.
- Money is integer **paise**. Weight/quantity is integer **grams** (or integer pieces). No floats for money or stock. Use `utils/money` and `utils/quantity`.
- Status changes go through the state-machine helper. Never `order.status = 'x'` directly.
- Stock changes are atomic conditional updates plus an `inventory_movements` record. Never overwrite a quantity.
- Never trust client-sent `vendorId` / `shopId` / `userId` for ownership; derive from the authenticated user.
- Every endpoint has Swagger decorators via the shared composites (`@ApiStandardResponses`, `@ApiPaginatedResponse`, `@Auth()`).
- Errors throw `AppException` with an `ErrorCode`. No raw strings in `throw new Error()`.
- All responses go through the response envelope interceptor. Lists are paginated with the shared DTOs.

### 5. Frontend rules
- No `import.meta.env` outside `src/config/env.ts`.
- All HTTP through `lib/api-client`. All server state through TanStack Query hooks in `features/<name>/api/`. Query keys from the feature's `keys.ts` factory.
- Forms: React Hook Form + Zod, built from `components/form` field components. Schemas reuse `utils/validation` primitives (phone, pincode, price, weight).
- Display formatting only via `utils/format` (`formatINR`, `formatWeight`, `formatDateIST`). Never inline `toFixed` / `toLocaleString` in a component.
- User-facing text goes through i18n keys (English + Tamil).
- API types come from the generated OpenAPI types (`npm run gen:api`), not hand-written copies.

### 6. Naming
- Files: `kebab-case.ts`. Classes/components: `PascalCase`. Exception: the admin shell in `admin/src/components/layout/{navbar,sidebar}/` uses PascalCase file names (`Navbar.tsx`, `SidebarLink.tsx`, `sidebarStyles.ts`) — keep that folder consistent with itself. Functions/vars: `camelCase`. Constants/enums: `UPPER_SNAKE` values in `PascalCase` enums.
- Mongo collections: `snake_case` plural (`inventory_movements`). Fields: `camelCase`.
- API routes: `/api/v1/<kebab-plural>`. Role-scoped prefixes: `/vendor/...`, `/admin/...`, `/delivery/...`.

### 7. Packages
- Before installing or using any npm package, follow the `package-install` skill: newest stable version whose `engines.node` accepts the system Node (`.nvmrc`), resolved with `node scripts/check-pkg.mjs <pkg>`. Never write a version from memory.
- npm only, lockfile committed, no `--force` / `--legacy-peer-deps`.
- **npm ≥ 11.21 required.** npm 10.8 crashes (`Cannot read properties of null (reading 'edgesOut')`) on this dependency tree. Use `npm i -g npm@11` or prefix commands with `npx -y npm@11`.
- New packages with install scripts must be approved: `npm install-scripts approve <pkg>` (writes `allowScripts` in `package.json`). Deny telemetry scripts.

### Server commands (`server/`)
| Task | Command |
| ---- | ------- |
| Dev (watch) | `npm run start:dev` |
| Build / run | `npm run build` then `npm start` |
| Unit tests | `npm test` (Vitest, `src/**/*.spec.ts`) |
| E2E tests | `npm run test:e2e` (real local MongoDB, `meat_shop_test` database) |
| Lint / types | `npm run lint`, `npm run typecheck` |
| Swagger | `http://localhost:4000/docs` (JSON at `/docs/json`, file `server/swagger.json`) |

### 8. Before you finish a task
1. Run `bash scripts/check-rules.sh` and fix every violation.
2. Lint + typecheck + tests for the app you touched.
3. Update `docs/REUSABLE_CHECKLIST.md` if you added or changed a shared item.

## Skills

Skills live in `.claude/skills/` (Claude Code) and are mirrored to `.agent/skills/` (Antigravity) by `bash scripts/sync-agent-skills.sh`. Edit only `.claude/skills/`, then run the sync.

| Skill              | Use when                                                        |
| ------------------ | --------------------------------------------------------------- |
| `reuse-first`      | Start of any coding task — find and reuse before creating       |
| `nest-module`      | Creating or changing a NestJS module, controller, service, DTO  |
| `mongo-schema`     | Creating or changing a Mongoose schema, index or repository     |
| `react-ui`         | Building or changing a UI primitive or layout component         |
| `react-feature`    | Building a page, feature, form, API hook in `public/` or `admin/` |
| `package-install`  | Before installing, upgrading or scaffolding with any npm package |
