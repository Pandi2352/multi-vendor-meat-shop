# Reusable Building Blocks Checklist

Build these **before** feature modules. Every feature must use them instead of writing its own version.
Tick an item when it exists, is exported from its barrel and has at least one test (where marked 🧪).

Legend: 🧪 needs unit test · ⭐ MVP-critical (build in Phase 1)

---

## Part A — Backend (`server/`)

Server facts: NestJS 12 is **ESM-only** → relative imports end in `.js`, cross-folder imports use Node subpath aliases from `package.json#imports` (`#config`, `#database`, `#bootstrap`, `#common/<folder>`, `#infra/<folder>`, `#modules/<name>`). Tests: Vitest (unit `src/**/*.spec.ts`, e2e `test/**/*.e2e-spec.ts`). Install with npm ≥ 11.21 (npm 10 crashes on this dependency tree).

### A1. Project tooling ⭐
- [x] Path aliases via `package.json#imports` (`source` condition → `src`, default → `dist`); Vitest aliases generated from the same map (`vitest.aliases.ts`)
- [x] ESLint flat config (typescript-eslint type-checked, no-console, ObjectId banned via `no-restricted-syntax`)
- [x] Prettier config shared with frontends (`.prettierrc` at repo root)
- [ ] Husky + lint-staged (lint, format, `scripts/check-rules.sh` on staged files)
- [ ] Commitlint (conventional commits)
- [x] `.env.example` with every variable documented
- [x] Local MongoDB via `MONGODB_URI` in `server/.env` (inspect with MongoDB Compass)
- [ ] Local MongoDB as a single-node replica set — needed before the checkout phase (transactions)
- [ ] Later (deployment phase): `Dockerfile` (multi-stage) for API and worker, optional `docker-compose.yml`
- [x] npm scripts: `start:dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `test:cov`, `format`
- [x] npm scripts: `seed` (Virudhunagar butcher stalls, cuts, live inventory batches)

### A2. Config (`src/config/`) ⭐
- [x] `env.validation.ts` — class-validator schema for every env var + defaults; boot fails listing every problem 🧪
- [x] `namespaces/app.config.ts` — name, env, port, apiPrefix, apiVersion, CORS origins, timeout, body limit, trust proxy
- [x] `namespaces/database.config.ts` — uri, pool size, autoIndex, server selection timeout
- [x] `namespaces/auth.config.ts` — access/refresh secrets + TTLs, OTP length/TTL/attempts/cooldown
- [x] `namespaces/platform.config.ts` — throttle, swagger, logger
- [x] `namespaces/business.config.ts` — default commission (bps), reservation TTL, slot length, slot capacity, weight variance %
- [ ] `redis.config.ts`, `queue.config.ts` — add with the first queue/cache use
- [ ] `storage.config.ts` — add with the uploads module
- [ ] `payment.config.ts` — add with the payments module
- [ ] `notification.config.ts` — add with SMS/OTP delivery
- [x] `app-config.module.ts` — global, registers all namespaces, runs validation
- [x] `app-config.service.ts` — typed access (`config.auth.accessTtl`), the only way to read config

### A3. Bootstrap (`src/bootstrap/`) ⭐
- [x] `setup-app.ts` — logger, HTTP logging, security, versioning, Swagger, shutdown hooks (used by `main.ts` and e2e)
- [x] `setup-security.ts` — helmet, cors, compression, trust proxy, body size limits
- [x] `setup-versioning.ts` — global prefix `/api`, URI versioning → `/api/v1/...`
- [x] Global pipe/filter/guards/interceptors live in `src/app.providers.ts` (APP_* providers, so tests get the same pipeline)
- [x] `setup-swagger.ts` — bearer auth, `/docs`, `/docs/json`, writes `swagger.json` for frontend type generation
- [x] Shutdown hooks (`enableShutdownHooks`); add Redis/queue close handlers when those exist

### A4. IDs (UUID — never ObjectId) ⭐
- [x] `common/utils/id.util.ts` — `generateId()` → UUID **v7**, `isUuid(value)` (v7 only) 🧪
- [x] `common/decorators/param.decorators.ts` — `@UuidParam('id')` (400 VALIDATION_FAILED on bad ids)
- [x] `common/dto/id-param.dto.ts` — `IdParamDto { @IsUUID('7') id }`
- [x] `common/validators/relation.validators.ts` — `@IsUuidV7()`, `@IsUuidArray()` for bulk ops
- [x] `common/utils/reference-number.util.ts` — `ORD-261023-7K3FQ`, `RFD-`, `SET-`, `PAY-`, `TKT-`, `DLV-` 🧪
- [ ] `CounterService.next(name)` — only if strictly sequential numbers are ever required

### A5. Database layer (`src/database/`) ⭐
- [x] `base.entity.ts` — `baseSchemaOptions` (timestamps, no `__v`, `_id → id` in JSON) + `BaseEntity` (`_id: string` UUID v7)
- [x] `create-schema.ts` — `createSchema(Class, { softDelete })`, use instead of `SchemaFactory.createForClass`
- [x] `plugins/soft-delete.plugin.ts` — `deletedAt`/`deletedBy`, hidden from queries + aggregations unless `withDeleted` (a leading `$geoNear` gets the filter in its `query`, since it must stay first) 🧪 (e2e)
- [ ] `plugins/audit-fields.plugin.ts` — `createdBy`, `updatedBy` (add with auth context)
- [x] `base.repository.ts` — `findById`, `findByIdOrThrow`, `findOne`, `findMany`, `paginate`, `create`, `createMany`, `updateById`, `updateByIdOrThrow`, `updateOne`, `softDelete`, `restore`, `exists`, `count`, `countByField` (docs per value, e.g. orders per status), `sumField` (dot paths, e.g. `totals.totalPaise`), `aggregate`; optional `session` + `withDeleted` everywhere 🧪 (e2e)
- [x] `transaction.helper.ts` — `runInTransaction(connection, fn)`; clear TRANSACTION_NOT_SUPPORTED error on standalone MongoDB
- [x] `query/query-builders.ts` — `buildFilter` (whitelist, arrays → `$in`), `buildSort` (whitelist), `buildSearchFilter`, `escapeRegex` 🧪
- [ ] `query/projection.util.ts` — reusable `select` presets (public vs owner vs admin)
- [x] `geo-point.schema.ts` — embedded GeoJSON point `[lng, lat]` with validation
- [x] `collection-name.enum.ts` — every collection name in one enum
- [ ] `seeds/` — seed runner + seeders: roles/permissions, admin user, categories, demo shop
- [ ] `migrations/` — index/data migrations

### A6. Common DTOs (`src/common/dto/`) ⭐
- [x] `pagination-query.dto.ts` — `page`, `limit` (max 100), defaults
- [x] `list-query.dto.ts` — `SortQueryDto`, `SearchQueryDto`, `ListQueryDto` (pagination + sort + search) 🧪
- [x] `date-range-query.dto.ts` — `from`, `to` (ISO 8601), `to >= from`
- [x] `geo.dto.ts` — `LatLngDto`, `GeoQueryDto` (`lat`, `lng`, `radiusKm`)
- [x] `paginated-result.ts` — `PaginatedResult<T>` returned by services; envelope turns it into `{ success, data, meta }`
- [x] `api-response.dto.ts` — Swagger models: success envelope, pagination meta, error response
- [x] `address.dto.ts` — line1, line2, locality, city, district (TN code), pincode, location
- [ ] Money/quantity value-object DTOs — not needed so far; `@IsPaise()` / `@IsGrams()` cover it

### A7. Custom validators & transformers (`src/common/validators`, `transformers`)
- [x] `@IsIndianPhone()` (E.164 `+91[6-9]XXXXXXXXX`) 🧪
- [x] `@IsPincode()`, `@IsTimeHHmm()`, `@IsSlug()`, `@IsDistrict()` 🧪
- [x] `@IsPaise({ allowZero, max })` — integer money 🧪
- [x] `@IsGrams({ step, min, max })` — integer grams, optional step 🧪
- [x] `@IsAfter(field, allowEqual)` — date ordering
- [x] `@Trim()`, `@ToLowerCase()`, `@ToInt()`, `@ToNumber()`, `@ToBoolean()`, `@ToArray()` 🧪
- [x] `@NormalizePhone()` → E.164 🧪

### A8. Decorators (`src/common/decorators/`) ⭐
- [x] `@Public()`, `@Roles(...)`, `@Permissions(...)`, `@SkipEnvelope()`
- [x] `@CurrentUser()` / `@CurrentUser('id')`
- [x] `@UuidParam()` (see A4)
- [x] `@ApiStandardResponses()` — shared error schema for 400/401/403/404/409/500 (or given statuses)
- [x] `@ApiOkEnvelope(Dto)` / `@ApiCreatedEnvelope(Dto)` / `@ApiEnvelope(Dto, { isArray })`
- [x] `@ApiPaginatedResponse(Dto)`
- [x] ~~`@ApiListQuery()`~~ — not needed: `@Query() q: ListQueryDto` documents page/limit/sort/q automatically
- [x] `@Auth(...roles)` — composite JWT guard + roles + `@ApiBearerAuth` (Phase 2, AuthModule)
- [x] `@CurrentShop()` — vendor's shop from the token, never the body (Phase 2)
- [ ] `@IdempotencyKey()` — with the idempotency interceptor (checkout phase)
- [ ] `@Audit(action, entityType)` — with the AuditModule

### A9. Guards (`src/common/guards/`) ⭐
- [x] `jwt-auth.guard.ts` — global, respects `@Public()` (Phase 2)
- [x] `roles.guard.ts` — 401 without user, 403 on wrong role (e2e)
- [x] `permissions.guard.ts` — requires every listed permission (e2e)
- [ ] `shop-ownership.guard.ts` — resource's `shopId` must belong to current vendor 🧪
- [ ] `resource-owner.guard.ts` — generic owner check (customer → own orders/addresses) 🧪
- [ ] `vendor-approved.guard.ts` — blocks unapproved/suspended vendors from selling actions
- [x] Throttler: global default (`infra/throttler`); per-route `@Throttle()` for login/OTP in Phase 2; `@SkipThrottle()` on health
- [ ] `webhook-signature.guard.ts` — verifies payment provider signature 🧪

### A10. Interceptors, filters, pipes, middleware ⭐
- [x] `interceptors/response-envelope.interceptor.ts` — `{ success, data, meta? }` (e2e)
- [x] Request logging — pino-http middleware (`infra/logger/http-logger.middleware.ts`) instead of a logging interceptor
- [x] `interceptors/timeout.interceptor.ts` — REQUEST_TIMEOUT after `REQUEST_TIMEOUT_MS`
- [ ] `idempotency.interceptor.ts` — stores response by key+user (checkout, payments) 🧪
- [ ] `audit.interceptor.ts` — writes audit log for `@Audit` handlers
- [x] `filters/all-exceptions.filter.ts` — single error shape with requestId/path/timestamp, hides internals in prod (e2e)
- [x] `filters/exception-mapper.ts` — AppException, HttpException, Mongo 11000 → 409 DUPLICATE_VALUE, Mongoose validation/cast, standalone-transaction errors 🧪
- [x] `pipes/create-validation-pipe.ts` + `validation-errors.util.ts` — `details: [{ field: 'address.pincode', messages }]` 🧪
- [x] Request id — reuses a valid incoming `X-Request-Id` or creates a UUID v7, echoed in response header and errors (e2e)
- [ ] Request id in AsyncLocalStorage so service logs carry it
- [ ] `parse-date-ist.pipe.ts` — when an endpoint needs it

### A11. Errors (`src/common/exceptions/`) ⭐
- [x] `error-code.enum.ts` — generic, auth, marketplace, payment codes
- [x] `error-catalog.ts` — default HTTP status + message per code
- [x] `app.exception.ts` — `new AppException(ErrorCode.OUT_OF_STOCK, { message?, details?, status?, cause? })`
- [x] `app-exceptions.ts` — `NotFoundAppException(entity, id)`, `ConflictAppException`, `ForbiddenAppException`, `BusinessRuleException`
- [x] `assert.util.ts` — `assertFound`, `assertOwner`, `assertCondition` 🧪 (via repository e2e)

### A12. Constants & enums (`src/common/constants/`, `enums/`) ⭐
- [x] `enums/role.enum.ts` (+ `VENDOR_ROLES`, `STAFF_ROLES`), `permission.enum.ts`, `role-permissions.map.ts`
- [x] `enums/status.enums.ts` — user, vendor verification, shop, product, order, payment, refund, delivery
- [x] `enums/catalog.enums.ts` — `Unit`, `SellMode`, `CutType`, `PreparationOption` (categories are data, not an enum)
- [x] `enums/finance.enums.ts` — `PaymentMethod`, `InventoryMovementType`, `LedgerEntryType`
- [x] `constants/tn-districts.constant.ts` — all 38 Tamil Nadu districts (code, English, Tamil)
- [x] `constants/swagger-tags.constant.ts`, `http.constants.ts` (headers, metadata keys)
- [x] `constants/regex.constant.ts` — phone, pincode, HH:mm, slug, sort
- [x] `constants/app.constants.ts` — IST timezone, currency, units, pagination, geo, limits
- [ ] `queue-names`, `event-names`, `cache-keys` constants — with the first queue/event/cache

### A13. Utilities (`src/common/utils/`) — pure functions, all 🧪
- [x] **money**: `toPaise`, `fromPaise`, `isPaise`, `sumPaise`, `applyBasisPoints`, `percentToBasisPoints`, `splitProportionally` (no lost paise), `formatINR`
- [x] **quantity**: `kgToGrams`, `gramsToKg`, `isGrams`, `priceForGrams`, `formatWeight`, `isWithinVariance`, `isValidStep`
- [x] **date (IST)**: `toIST`, `nowIST`, `startOfDayIST`, `endOfDayIST`, `formatIST`, `todayIST` (`YYYY-MM-DD`), `todayRangeIST` (Mongo `$gte/$lte` for the IST day), `addMinutes`, `isExpired`, `timeToMinutes`, `minutesToTime`, `isWithinHours` (handles past-midnight), `generateSlots`
- [x] **string**: `slugify`, `normalizePhone`, `isIndianMobile`, `maskPhone`, `maskEmail`, `titleCase`, `truncate`, `randomCode`
- [x] **crypto**: `sha256`, `hmacSha256`, `safeCompare`, `generateOtp`, `randomToken`
- [x] **password**: `hashPassword`, `verifyPassword` (`node:crypto` `scryptSync`, timing-safe compare) 🧪
- [x] **collection**: `pick`, `omit`, `compact`, `isPlainObject`, `chunk`, `groupBy`, `keyBy`, `uniqBy`, `sumBy`
- [x] **geo**: `toGeoPoint`, `fromGeoPoint`, `haversineKm`, `isWithinRadius`, `kmToRadians`, `kmToMeters`
- [x] **pagination**: `clampLimit`, `getSkip`, `buildPaginationMeta`
- [x] **async**: `sleep`, `retry` (exponential backoff), `withTimeout`
- [x] **state machine**: `createStateMachine(name, transitions)` → `canTransition`, `assertTransition`, `nextStates` (actor-aware)

### A14. Auth building blocks (`src/modules/auth/`) ⭐ — Phase 2
- [x] `TokenService` — sign/verify access & refresh, token family, rotation, reuse detection 🧪
- [x] `SessionService` (RefreshSessionRepository) — store hashed refresh tokens, revoke one / all, TTL index
- [x] `OtpService` — generate, hash, verify, attempt limits, resend cooldown, email delivery 🧪
- [x] `JwtAuthGuard` — reads Bearer token, respects `@Public()`, sets `req.user`
- [x] `AuthUser` / `AppRequest` interfaces (`common/interfaces`)
- [x] `AdminUsersService` & `AdminUsersController` — user management, role assignments, status management, invitations lifecycle 🧪 (e2e)
- [x] `RolePermissionRepository` & `AdminRolesController` — dynamic RBAC role permission overrides and catalog mapping 🧪 (e2e)
- [x] `ShopRepository.$geoNear` — spherical geodesic distance aggregation using free MongoDB 2dsphere index without external paid map APIs

### A15. Infrastructure adapters (`src/infra/`) — interface + provider swap
- [x] **logger**: pino + `AppLogger` (Nest LoggerService), pretty in dev with ANSI colorization (`colorize: true`), JSON in prod, redaction of tokens/passwords/OTPs/phones ⭐ — nestjs-pino skipped (no release supports both Nest 12 and Node 20)
- [x] **throttler**: `AppThrottlerModule` from config
- [x] **health**: Terminus `/api/v1/health` (Mongo ping + heap) and `/api/v1/health/live` ⭐
- [ ] **events**: `@nestjs/event-emitter`, typed event payload classes per event name
- [ ] **cache**: `CacheService` (get/set/del/wrap) + key builders + TTL constants
- [ ] **queue**: BullMQ registration helper, `BaseProcessor`, default job options
- [ ] **storage**: `StorageService` interface → Cloudinary / S3 adapters
- [ ] **file validation**: `ParseFilePipe` preset (mime + size), `@UploadImages(max)`
- [ ] **sms**: `SmsService` interface + provider + console provider for dev
- [x] **email**: `MailService` with Nodemailer SMTP transport
- [ ] **push**: `PushService` interface (FCM/Web Push)
- [ ] **payment**: `PaymentProvider` interface → Razorpay adapter
- [ ] **maps** (later): `GeocodingService` interface

### A16. Domain helpers shared across modules
- [ ] `PricingService` — line total, delivery fee rules, coupon discount, tax, commission 🧪
- [x] `InventoryService.reserve/release/commit` — atomic conditional update + movement log 🧪
- [ ] `LedgerService.post(entries[])` — append-only, balanced entries, reversal instead of edit 🧪
- [x] `OrderSnapshot` builder (`OrderRepository`, `OrderEventRepository`, `OrderTotals`) 🧪
- [x] `OrderNumberService` — sequential atomic `TN-YYYYMMDD-XXXX` counter generator 🧪
- [x] `ORDER_STATUS_MACHINE` — transitions and permitted actor roles for order lifecycle 🧪
- [ ] `AuditService.log(actor, action, entity, before?, after?)`
- [ ] `NotificationDispatcher.send(userId, type, payload)`
- [ ] `ServiceabilityService.check(shopId, coordinates)` — radius/zone + open hours

### A17. Module template (copy for every feature)
```
modules/<feature>/
  <feature>.module.ts
  controllers/   <feature>.controller.ts | vendor-<feature>.controller.ts | admin-<feature>.controller.ts
  services/      <feature>.service.ts (+ small focused services)
  repositories/  <feature>.repository.ts (extends BaseRepository)
  schemas/       <feature>.schema.ts (extends BaseEntity)
  dto/           create-*.dto.ts, update-*.dto.ts, query-*.dto.ts, *-response.dto.ts
  mappers/       <feature>.mapper.ts (entity → response DTO)
  constants/     <feature>.constants.ts
  events/        <feature>-*.event.ts
  index.ts
```
- [x] Reference module: `modules/health`
- [x] Vendor & Stalls Onboarding: Public `POST /vendors/apply` endpoint + application modal, Admin `POST /admin/vendors` direct add + review & verification workflow (`PATCH /admin/vendors/:id/verify`)
- [ ] Generator script that creates this structure (Nest CLI generators don't run on Node 20)

### A18. Testing helpers (`server/test/`)
- [x] `helpers/create-test-app.ts` — real `AppModule` + optional test controllers/modules, same global pipeline
- [x] `setup-env.ts` — e2e uses `meat_shop_test` database (override with `MONGODB_TEST_URI`), silent logs
- [x] `fixtures/probe.controller.ts`, `fixtures/test-item.schema.ts` — exercise the shared HTTP and DB layers
- [ ] `factories/` — `userFactory`, `vendorFactory`, `shopFactory`, `productFactory`, `orderFactory`
- [ ] `auth.helper.ts` — `loginAs(role)` → bearer token (Phase 2)
- [ ] Replica-set test database for transaction tests (checkout phase)

---

## Part B — Frontend (`public/` and `admin/` — same structure in both)

### B1. Project tooling ⭐
- [x] Vite path alias `@/` → `src/`, mirrored in `tsconfig`
- [ ] ESLint (react, react-hooks, jsx-a11y, import order) + Prettier with `prettier-plugin-tailwindcss`
- [ ] Husky + lint-staged + `scripts/check-rules.sh`
- [x] `npm run gen:api` — `openapi-typescript` from `server/swagger.json` → `src/types/api.generated.ts`
- [x] Vitest + React Testing Library setup
- [x] `.env.example`

### B2. Config (`src/config/`) ⭐
- [x] `env.ts` — Zod-validated `import.meta.env` (API URL, app name, default locale, map keys); the only env reader
- [x] `app.config.ts` — app name, support phone, default page size, upload limits, currency, timezone
- [x] `routes.ts` — every route path as a constant + `buildPath(route, params)` helper
- [ ] `nav.config.ts` (admin) — sidebar items per role with permission keys

### B3. Theme & design tokens (`src/styles/theme.css`) ⭐
- [x] `@theme` clears radius namespace and defines only `--radius-md` → `rounded-lg/xl` cannot be generated
- [x] `@theme` clears `--shadow-*`, `--inset-shadow-*`, `--drop-shadow-*`, `--text-shadow-*` → no shadow utilities exist
- [x] Semantic color tokens: `background`, `surface`, `surface-muted`, `border`, `text`, `text-muted`, `primary`, `primary-foreground`, `success`, `warning`, `danger`, `info` (+ `-soft` backgrounds)
- [ ] Dark mode token overrides
- [x] Fonts: Inter + Noto Sans Tamil; type scale tokens
- [ ] Focus ring token (`ring-2 ring-primary/40`) — the accessible replacement for shadow-based focus
- [ ] z-index scale tokens (dropdown, sticky, overlay, modal, toast)

### B4. Core lib (`src/lib/`) ⭐
- [x] `cn.ts` — `clsx` + `tailwind-merge` 🧪
- [x] `api-interceptors.ts` — attach token, refresh-on-401 with request queue (single refresh in flight), unwrap envelope, normalize errors
- [x] `api-error.ts` — `ApiError` class + `getErrorMessage(err)` + `getFieldErrors(err)` 🧪
- [x] `token-storage.ts` — memory + localStorage JWT access and refresh token storage
- [x] `http.ts` — typed `get<T>`, `post<T>`, `patch<T>`, `del<T>`, `getPaginated<T>`
- [x] `query-client.ts` — TanStack Query defaults (staleTime, retry rules: no retry on 4xx)
- [ ] `i18n.ts` — react-i18next, `en` + `ta` namespaces, language persistence
- [ ] `storage.ts` — safe `localStorage` wrapper (try/catch, JSON, versioned keys)
- [x] `logger.ts` — dev-only console wrapper (no raw `console.log` in code)

### B5. UI primitives (`src/components/ui/`) — `rounded-md`, no shadow, `cva` variants ⭐
- [x] `Button` (variants: primary, secondary, outline, ghost, danger; sizes; `loading`, `leftIcon`, `rightIcon`, `fullWidth`)
- [ ] `IconButton`
- [ ] `Input`, `Textarea`, `NumberInput`, `PasswordInput`, `PhoneInput` (+91 prefix), `OtpInput`
- [ ] `Select`, `Combobox` (searchable), `MultiSelect`
- [ ] `Checkbox`, `Radio`, `RadioGroup`, `Switch`
- [ ] `Label`, `HelperText`, `ErrorText`
- [ ] `Card` (`CardHeader`, `CardBody`, `CardFooter`) — border + surface, no shadow
- [x] `Badge`, `StatusBadge` (maps any status enum → tone via config), `Chip` / `FilterChip`
- [ ] `Avatar` (rounded-full exception), `AvatarGroup`
- [x] `Spinner`, `Skeleton`, `ProgressBar`
- [x] `Alert` / `Banner`, `Toast` (sonner or custom), `EmptyState`, `ErrorState`
- [x] `Modal` / `Dialog`, `ConfirmDialog`, `Drawer` / `Sheet` (`CheckoutModal`, `CartDrawer`, `WeightRecordingModal`, `RejectOrderModal`)
- [ ] `DropdownMenu`, `Popover`, `Tooltip` (Radix / Headless UI base, our styling)
- [x] `Tabs`, `Accordion`, `Stepper`, `Timeline` (order status history)
- [ ] `Breadcrumbs`, `Divider`, `Kbd`, `CopyButton`, `Link`
- [ ] `Image` (lazy, aspect ratio, fallback), `ImageGallery`
- [ ] `Rating` (display + input)
- [ ] `DatePicker`, `DateRangePicker`, `TimePicker`, `TimeRangeInput` (business hours)
- [x] `SearchInput` (with clear X button, consistent h-10 height, and text-sm font)
- [x] `CustomSelect` / `Select` (pure custom combobox with search, multi-select, auto-flip top/bottom, left/right collision detection, keyboard navigation, no native select tags)
- [x] `Tabs` (compact h-8 light-color segmented tabs with icons, count pills, and zero shadows)
- [x] `Pagination` (advanced reusable pagination with smart ellipsis, page size selector, jump to page, summary count, light-themed controls)
- [x] `LoaderState` (clean, simple spinner with status title and description for all API loading states; zero skeletons)
- [ ] `Icon` — single re-export point for `lucide-react` icons
- [x] `index.ts` barrel

### B6. Domain display components (`src/components/domain/`)
- [x] `PriceText` (paise → ₹, strike-through MRP), `PricePerKg`
- [x] `WeightText` (grams → `500 g` / `1.5 kg`)
- [x] `WeightSelector` (preset 250/500/1000 g + custom step) and `QuantityStepper`
- [x] `OrderStatusBadge`, `PaymentStatusBadge`, `VerificationStatusBadge`, `DeliveryStatusBadge`
- [x] `OrderTimeline`
- [ ] `ShopOpenIndicator` (open / closed / opens at)
- [ ] `AddressCard`, `AddressText`
- [ ] `DeliverySlotPicker`
- [x] `ProductCard`, `ShopCard` (used in both list and search results)
- [ ] `DistanceText`, `EtaText`

### B7. Data display (`src/components/data/`)
- [ ] `DataTable<T>` — columns config, sorting, row selection, loading/empty/error states, row actions, responsive (cards on mobile)
- [x] `Pagination` (+ page size select, smart ellipsis, quick jump, responsive summary)
- [ ] `InfiniteList` (intersection observer)
- [ ] `FilterBar` — config-driven filters synced to URL
- [x] admin `StatCard` (ui: label, value, hint, icon tone, optional `to` link, `attention` tint) + `Panel` (ui: titled section with header action, `flush` for lists)
- [ ] `Chart` wrapper (Recharts) — `LineChart`, `BarChart`, `DonutChart` with theme colors
- [ ] `DescriptionList` (key/value detail view)
- [ ] `ExportButton` (CSV)

### B8. Layout (`src/components/layout/`) ⭐
- [x] admin `AdminLayout` — docked sidebar (collapsible to an icon rail, remembered per browser) + sticky navbar; drawer below `lg`
- [x] admin `layout/sidebar/*` — `Sidebar`, `SidebarBrand`, `SidebarNav`, `SidebarSection`, `SidebarGroup` (expandable), `SidebarLink` (badges, Soon), `SidebarFlyout` (collapsed hover/focus panels), `SidebarIcon`, `SidebarFooter`, `sidebarStyles.ts`
- [x] admin `layout/navbar/*` — `Navbar` (breadcrumb), `SidebarToggle`, `SearchTrigger` (Ctrl/⌘+K page search), `QuickCreateMenu`, `NotificationsMenu` (empty state until an API exists), `UserMenu`
- [x] admin `config/nav.config.ts` + `nav.utils.ts` — one nav list drives sidebar, breadcrumb, search and coming-soon routes
- [x] Sidebar filtered by role (`filterNavForRole` + `useVisibleNav`)
- [ ] `MobileBottomNav` (storefront)
- [ ] `PageHeader` (title, description, breadcrumbs, actions slot)
- [ ] `PageContainer`, `Section`, `Stack`, `Inline`, `Grid`
- [ ] Layouts: `AuthLayout`, `CustomerLayout` (public), `VendorLayout`, `AdminLayout`, `DeliveryLayout` (admin app)
- [x] `ErrorBoundary` + `RouteErrorPage`, `NotFoundPage`, `ForbiddenPage`, `MaintenancePage` (ServerErrorPage)
- [x] admin Suspense fallback inside `AdminLayout`; `ComingSoonPage` for unbuilt nav entries
- [x] admin primitives added: `Dropdown` (+ `DropdownItem`, `DropdownLabel`, `DropdownSeparator`), `Dialog`, `Avatar`, `Kbd`, Button `size="icon"`
- [x] admin form layer: `Input` (icon, invalid, sizes), `FormField` (label/hint/error + aria ids), `Alert`, `useZodForm`, `applyServerErrors`, `utils/validation` (`zEmail`, `zOtp`, `zRequiredString`)
- [x] admin `AuthLayout` — split screen (brand panel + form column) for every sign-in page
- [x] admin auth (invite-only): portal endpoints `/auth/portal/otp/send|verify` never create accounts; `features/auth` with `pendingSignIn` hand-off and `?reason=signed-out|expired` notices
- [x] admin session: `useSession` (/auth/me, statuses anonymous/expired/loading/authenticated/error), `RequireSession`, `RedirectIfSignedIn`, `RoleHomeRoute`, `useSignOut` (revokes server sessions), `usePostLoginRedirect` (safe `?next=`), `storeSession`/`clearSession`, `getRoleHome`, `buildLoginPath`
- [x] server `InvitationsService.issue()/resend()` (users module) — the only way to create/re-send invitations: 256-bit token, only its SHA-256 stored, set-password link emailed, one-time `inviteUrl` + `emailSent` returned (never listed). Used by admin invites, vendor create/approve and shop staff
- [x] server `MailService` with `MAIL_DRIVER=smtp|log` (log prints emails + links for local testing), templates in `infra/mail/templates` (shared layout, escaped values), `escapeHtml` util, `ROLE_LABELS`, `ADMIN_APP_URL` / `APP_DISPLAY_NAME` config
- [x] server sign-in status gate (`assertCanSignIn`): suspended → ACCOUNT_SUSPENDED, pending → ACCOUNT_PENDING, deleted → invalid credentials — applies to password, code, invite and refresh
- [x] server vendor approval gate: `@RequireApprovedVendor()` (class or handler; `false` opts a handler out) + global `ApprovedVendorGuard` → vendor roles get 403 `VENDOR_NOT_APPROVED` on writes while the shop isn't APPROVED (reads always pass). `VendorAccessService.getStatus/assertCanSell(shopId)` for checks inside services; `GET /vendor/status` for the UI. Applied to vendor products, inventory, shops and staff; orders and finance stay open so in-flight orders and payouts finish
- [x] admin `features/vendor-status` — `useVendorStatus` (vendor roles only, refetch on focus) + `VendorStatusBanner` (mounted once in `AdminLayout`, per-status copy + admin note)
- [x] server forgot password: `PasswordResetService` (auth module) behind `/auth/portal/password/{forgot, reset/:token, reset}` — one reset per user in `password_resets` (SHA-256 only, new request replaces the old link), same answer for every email, `PASSWORD_RESET_TTL_MINUTES` / `PASSWORD_RESET_COOLDOWN_SECONDS`, `RESET_LINK_INVALID` with `details.problem` (invalid/used/expired), reset signs out every other session and emails a "password changed" notice. Mail templates `password-reset` / `password-changed`
- [x] server `@IsAccountPassword()` validator + `LIMITS.PASSWORD_MIN_LENGTH/MAX_LENGTH` (8–128) — every new portal password (invite, reset). `AuthService.issueSession(user, ctx)` is public for flows that end signed in
- [x] admin `PasswordInput` (ui: lock icon + show/hide toggle), `zNewPassword` + `PASSWORD_MIN_LENGTH` (utils/validation, mirrors the server), `useCountdown` (hooks: resend timers)
- [x] admin auth: `NewPasswordFields` + `newPasswordSchema` / `newPasswordShape` (accept-invite and reset), `ForgotPasswordPage`, `ResetPasswordPage`, `ResetLinkUnavailable`, `getResetLinkProblem`
- [x] server dashboards module: `GET /vendor/dashboard` (owner + staff; `payouts` owner only) and `GET /admin/dashboard` (all admin roles; `money` for ADMIN/FINANCE only). Read-only, built on existing repositories; `buildStockSummary` + `toOrderPreviewDto` mappers. Order status groups `IN_PROGRESS_ORDER_STATUSES`, `UNFULFILLED_ORDER_STATUSES`, `NON_SALE_ORDER_STATUSES` (orders constants)
- [x] admin `features/dashboard` — `VendorDashboardPage` (`/vendor`, vendor home) and `AdminDashboardPage` (`/`); `DashboardHeader`, `SummaryList`; admin cards and shortcuts link only where `canAccessPath` allows. Orders tabs: `VENDOR_ORDER_TABS`, `vendorOrdersTabPath(tab)`. Format: `formatNumber`, `formatDayIST`
- [x] server permissions on vendor endpoints: `@Permissions()` on orders (`order.read`/`order.fulfil`), stock (`inventory.manage`), catalogue (`product.manage`), shop settings (`shop.manage`), staff (`staff.manage`, new), finance (`settlement.read`, `payout.request`, new). Locked by `src/modules/vendor-permissions.spec.ts`. User responses carry `permissions`
- [x] server `SessionUserService` (auth) — the auth guard re-reads the account per request: suspended/removed → refused at once, role or shop changed → `AUTH_SESSION_REVOKED` (app refreshes), permissions from the current role. `assertCanSignIn` moved to `auth/utils/account-status.util.ts`
- [x] server `resolveShopId` behind `@CurrentShop()` — vendors get their own shop only; admin roles choose by UUID (`x-shop-id` / `?shopId=`)
- [x] admin `useHasPermission(...)` / `usePermissionCheck()` (auth) + `Permission` type (`constants/permissions.ts`); quick actions take an optional `permission`; `ShopSwitcher` is admin-only; any `ACCOUNT_SUSPENDED` response sends the app to `/suspended`
- [x] server shop staff (users module): `VendorStaffService` — invite (no account created until accepted; one live invite per email), resend, cancel, edit, suspend, remove (back to a customer account). `canJoinShopAsStaff(account, shopId)` checked at invite and again at accept. `ShopNameLookup.nameOf(shopId)` for emails and the accept page (no shops-module dependency). Invitation responses carry `dutyTitle` and `isExpired`; the job title carries over to the account on accept
- [x] admin `ConfirmDialog` (ui, on `Dialog`) for one-action "are you sure?" steps; `zOptionalIndianPhone` (utils/validation, same rule as the server's `IsIndianPhone`)
- [x] admin `features/vendor-staff` — Stall team page: `TeamMemberRow` (owner first, no actions on the owner), `PendingInviteRow` (resend / cancel), `InviteStaffDialog` (shows `InvitationResult`), `EditStaffDialog`, `StaffDetailsFields`, `StaffConfirmDialog`, `useStaffActions`; generated API types only
- [x] admin `InvitationResult` (users) + `VendorInvitedPanel` (vendors) — show emailed / not-emailed with the one-time copy link; `InvitationUnavailable` for used/expired/revoked/invalid links
- [x] admin `config/route-access.ts` — `ROUTE_ACCESS` (who may open each page, mirrors server `@Auth`), `canAccessPath`, `roleAllowed` (super admin ⊇ ADMIN). Single source for `RouteAccessGuard` (403 inside the layout), `filterNavForRole` (sidebar/search/breadcrumb via `useVisibleNav`) and quick actions. New page → add a rule here, nothing else
- [x] admin `constants/roles.ts` — role groups (admin / vendor / delivery / portal) + `ROLE_LABELS`, typed from the generated API
- [x] admin `FullPageLoader`, `AccessDeniedPage`, `SuspendedPage`
- [x] admin `Tooltip` — dark chip + arrow, `side` top/right/bottom/left, optional `shortcut` keys, portaled, hides on scroll. Use it instead of `title=` attributes
- [x] admin theme base layer: pointer cursor on every interactive element (not-allowed when disabled), custom rounded scrollbars, `scrollbar-subtle` utility (thumb shows on hover), `animate-pop-in`
- [x] admin content area is full width (no centered max-width wrapper) — pages must not add their own `max-w-* mx-auto` page container
- [x] admin hooks: `useClickOutside`, `useEscapeKey`, `useHotkey`, `useMediaQuery`/`useIsDesktop`, `usePersistedState`, `useCurrentUser` (placeholder until auth); `lib/storage.ts`

### B9. Forms (`src/components/form/` + `src/utils/validation/`) ⭐
- [ ] `Form` wrapper (RHF `FormProvider` + submit handling + server error mapping)
- [ ] `useZodForm(schema, options)` hook
- [ ] Field components bound to RHF: `FormInput`, `FormTextarea`, `FormSelect`, `FormCombobox`, `FormCheckbox`, `FormSwitch`, `FormRadioGroup`, `FormPhone`, `FormOtp`, `FormPrice` (₹ ↔ paise), `FormWeight` (kg ↔ grams), `FormDate`, `FormTimeRange`, `FormImageUpload`
- [ ] `FormField` (label + control + hint + error layout)
- [ ] `FormActions` (submit/cancel row, sticky on mobile)
- [ ] Zod primitives: `zPhone`, `zPincode`, `zPaise`, `zGrams`, `zUuid`, `zDistrict`, `zTimeHHmm`, `zRequiredString`, `zOptionalString`, `zEmail`, `zPassword` 🧪
- [ ] `applyServerErrors(form, apiError)` 🧪

### B10. Hooks (`src/hooks/`)
- [ ] `useDebounce`, `useDebouncedCallback` 🧪
- [ ] `useDisclosure` (open/close/toggle) 🧪
- [ ] `useMediaQuery`, `useBreakpoint`
- [ ] `useLocalStorage`
- [ ] `useUrlState` / `useQueryParams` — filters, page, sort synced to URL 🧪
- [x] admin `useSearchParamState(key, allowed, fallback)` — one allowed value in the URL (orders page tab)
- [x] admin `useCountdown` — resend timers
- [ ] `usePagination`
- [ ] `useConfirm` (promise-based confirm dialog)
- [ ] `useCopyToClipboard`
- [ ] `useGeolocation`
- [ ] `useIntersectionObserver`
- [ ] `useOnClickOutside`, `useEscapeKey`
- [ ] `useCountdown` (OTP resend, reservation expiry) 🧪
- [ ] `useDocumentTitle`
- [ ] `useAuth`, `usePermission(permission)`, `useRole()`
- [ ] `useToast`

### B11. API & server state pattern (per feature)
- [ ] `features/<f>/api/keys.ts` — query key factory (`orderKeys.all`, `.list(filters)`, `.detail(id)`)
- [ ] `features/<f>/api/<f>.api.ts` — plain request functions using `http.ts`
- [ ] `features/<f>/api/use-<f>-queries.ts` — `useXList`, `useXDetail`
- [ ] `features/<f>/api/use-<f>-mutations.ts` — `useCreateX`, `useUpdateX` built on shared `useAppMutation`
- [x] Vendor Products Catalogue (`/vendor/products`): Meat cuts, per-kg pricing (₹/paise), package sizes (250g, 500g, 1kg), butchery prep options (Skin-on, Skin-off, Cleaned, Small pieces), daily freshness & stock status toggle
- [x] Vendor Stall Staff Management (`/vendor/staff`): Stall cutters, billing staff, dispatch handlers, invite links, active/suspended toggle, shop isolation
- [x] Vendor Shop Profile Operations (`/vendor/shops`): Operating schedule, delivery radius, base delivery fee, butchery schedule, stall switcher for Admin multi-tenant management
- [ ] Shared `useAppMutation` — success toast, error toast, invalidate keys, optimistic update option
- [ ] Shared `usePaginatedQuery` — page/limit/sort from URL state

### B12. State stores (`src/stores/`, Zustand)
- [ ] `auth.store.ts` — user, access token (memory), role, permissions
- [ ] `cart.store.ts` (public) — single-shop cart, persisted, shop-switch confirmation
- [ ] `location.store.ts` (public) — selected address / coordinates / pincode
- [ ] `ui.store.ts` — sidebar collapsed, theme, language
- [ ] `create-persisted-store.ts` helper (versioned, migration-safe)

### B13. Routing & access (`src/app/router/`) ⭐
- [ ] Route config arrays per area (customer / vendor / admin / delivery), lazy-loaded with a shared `lazyPage()` helper
- [ ] `ProtectedRoute` (auth), `RoleRoute` (role), `PermissionGate` (component-level hide/show)
- [ ] `GuestRoute` (login pages redirect when signed in)
- [ ] Scroll restoration, document title per route

### B14. Utils (`src/utils/`) — pure, all 🧪
- [x] **format**: `formatINR(paise)`, `formatWeight(grams)`, `formatDateIST`, `formatTimeIST` 🧪
- [x] **distance**: `calculateDistanceKm(lat1, lon1, lat2, lon2)`, `formatDistance(km)` (Haversine proximity formula) 🧪
- [ ] **string**: `truncate`, `initials`, `slugify`, `titleCase`
- [ ] **url**: `toQueryString(params)` (skips empty), `parseQueryString`
- [ ] **status**: `getStatusTone(enum, value)`, `getStatusLabel(enum, value)` from one status config map
- [ ] **file**: `validateFile(file, rules)`, `readAsDataUrl`
- [ ] **money/quantity**: same math as backend (`priceForGrams`, `kgToGrams`) — mirror the backend tests

### B15. Constants & types (`src/constants/`, `src/types/`)
- [ ] Enums mirrored from generated API types (roles, statuses, units, categories) — never retyped by hand
- [x] `status-config.ts` — label key + tone for every status enum
- [x] `tn-districts.ts` — 38 Tamil Nadu districts in English and Tamil
- [x] `finance` — `commissions`, `settlements`, `ledger_entries` modules, double-entry ledger portal & admin payout disbursements (/admin/finance)
- [x] `disputes` — `support_tickets` module, meat complaint arbitration, ledger debit adjustments & admin resolution portal (/admin/disputes)
- [x] `addresses` — customer address book with TN district selection and pincode validation
- [ ] `pagination.ts` defaults, `upload.ts` limits
- [ ] `types/api.generated.ts` (generated), `types/common.ts` (`ID = string`, `Paginated<T>`, `ApiResponse<T>`, `SelectOption`)

### B16. App providers (`src/app/providers/`) ⭐
- [ ] `AppProviders` composing: `QueryClientProvider`, `I18nextProvider`, `ThemeProvider`, `ToastProvider`, `ConfirmProvider`, `RouterProvider`, `ErrorBoundary`

### B17. Feature folder template
```
features/<feature>/
  api/         keys.ts, <feature>.api.ts, use-<feature>-queries.ts, use-<feature>-mutations.ts
  components/  small feature-only components
  hooks/       feature logic hooks
  pages/       route pages (thin: compose components + hooks)
  schemas/     zod form schemas
  constants/
  index.ts
```

### B18. Testing helpers
- [ ] `test/render.tsx` — render with all providers + memory router
- [ ] `test/msw/handlers/` per feature + `server.ts`
- [ ] `test/factories/` — fake entities matching generated types

### B19. Quality gates
- [ ] Accessibility: labels on every input, focus-visible ring, keyboard nav for dialogs/menus, 44px tap targets on mobile
- [ ] Every data view handles loading, empty, error states with the shared components
- [ ] Responsive: storefront mobile-first; admin tables collapse to cards under `md`

---

## Part C — Shared across repo

- [x] `scripts/check-rules.sh` — fails on shadows, non-md radius, ObjectId, `process.env` / `import.meta.env` outside config, `console.log`, oversized files
- [x] `scripts/sync-agent-skills.sh` — mirrors `.claude/skills` → `.agent/skills`
- [x] `scripts/check-pkg.mjs` — newest stable package version compatible with the system Node + peer deps
- [x] `.nvmrc` — pinned to system Node (`20.19.4`)
- [ ] Root `.prettierrc`, `.editorconfig`, `.gitignore`
- [ ] `engines.node` in each app's `package.json` matching `.nvmrc`
- [ ] Single source for enums: backend enums → Swagger → `gen:api` → frontend types
- [ ] CI pipeline: lint, typecheck, test, check-rules, build for all three apps
- [ ] `docs/decisions/` — short ADRs (UUID v7, paise/grams integers, single-shop cart, modular monolith)
- [ ] Optional later: move shared UI + utils into a `packages/` workspace if `public` and `admin` drift
