---
name: package-install
description: Use before installing, upgrading, adding to package.json, scaffolding with a CLI (nest new, npm create vite), or writing code against any npm package. Picks the newest stable version compatible with the system Node version, checks peer dependencies, and forbids versions recalled from memory.
---

# Package install — latest version compatible with system Node

Versions remembered from training data are usually outdated. **Never write a version number from memory.** Always ask the registry.

## Steps
1. **Read the system Node version.**
   ```bash
   node -v && npm -v
   ```
   If it differs from `.nvmrc`, stop and tell the user. Do not change the Node version yourself.

2. **Resolve versions from the registry** for every package you plan to add, in one call:
   ```bash
   node scripts/check-pkg.mjs <pkg> [pkg...]
   ```
   It prints, for each package, the newest **stable** version whose `engines.node` accepts the current Node, plus its peer dependencies.
   - `[latest]` → use it.
   - `latest is X (needs node …)` → use the version printed, and tell the user a newer major exists that needs a newer Node.
   - `✗` → the package name is wrong or nothing supports this Node. Do not guess, ask the user.

3. **Check that peer dependencies line up** with versions already in `package.json` (for example `@nestjs/*` majors must match each other, `@vitejs/plugin-react` must match the `vite` major, `@types/node` must match the Node major). If a peer conflicts, pick versions that satisfy each other, using the script output. **Never use `--force` or `--legacy-peer-deps`** to hide a conflict.

4. **Install with exact versions from step 2**, in the right app folder:
   ```bash
   npm install <pkg>@<version>          # runtime dependency
   npm install -D <pkg>@<version>       # tooling, types, test libs
   ```
   Group related packages in one command (`@nestjs/mongoose mongoose`, `react-hook-form @hookform/resolvers zod`).
   Scaffolding CLIs use `@latest`: `npx @nestjs/cli@latest new`, `npm create vite@latest`. Then run step 2 on what they generated.

5. **Verify.**
   ```bash
   npm ls <pkg>                        # resolved version, no "invalid" / "UNMET PEER"
   npm run typecheck && npm run build
   ```
   An `EBADENGINE` warning means a wrong version was picked → go back to step 2.

6. **Read the current docs before writing code against a package.** APIs change between majors (Tailwind v4 uses CSS `@theme` instead of `tailwind.config.js`, React Router merged packages, ESLint uses flat config). Check the installed version's README/changelog through WebFetch or `node_modules/<pkg>/README.md` instead of relying on memory.

## Known issues in this repo
- **npm 10.8 crashes** with `Cannot read properties of null (reading 'edgesOut')` on Vite/Vitest peer cycles. Use npm ≥ 11.21 (`npx -y npm@11 install ...` if the global npm is older).
- npm 11 blocks install scripts until approved: `npx -y npm@11 install-scripts ls`, then `approve <pkg>` for needed ones (e.g. `@swc/core`) and `deny <pkg>` for telemetry (e.g. `@scarf/scarf`).
- **Nest CLI (`nest new`, `nest start`, `nest g`) does not run on Node 20** (ESM `ora` require cycle). The server builds with `tsc` and runs dev with `tsc-watch`.
- **Latest major may need Node 22+** (e.g. `nestjs-pino@5`, `vitest@5`, `npm@12`). The script picks the newest compatible version; report held-back packages to the user.
- Check peer ranges with the script output — e.g. TypeScript 7 is excluded because `ts-jest`, `typescript-eslint` and `@nestjs/swagger` peers cap at 6.x.

## Rules
- One package manager: **npm**. Commit `package-lock.json`. No `yarn.lock` / `pnpm-lock.yaml`.
- Keep the default caret range npm writes (`^x.y.z`). The lockfile pins exact versions.
- `@types/*` only when the package doesn't ship its own types.
- Before adding a package, check `docs/REUSABLE_CHECKLIST.md` and the existing `package.json`. Don't add a second library for the same job (one date lib, one HTTP client, one icon set, one validation lib per side).
- Prefer well-maintained packages: recent release, TypeScript types, no deprecation notice (`npm view <pkg> deprecated`).
- Upgrading an existing package: run step 2, read the changelog for breaking changes between the old and new major, then run the full test suite.
- Report to the user which packages and versions were added, and any package held back by the Node version.
