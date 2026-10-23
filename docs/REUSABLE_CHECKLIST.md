# Reusable Building Blocks Checklist

Build these **before** feature modules. Every feature must use them instead of writing its own version.
Tick an item when it exists, is exported from its barrel and has at least one test (where marked 🧪).

Legend: 🧪 needs unit test · ⭐ MVP-critical (build in Phase 1)

---

## Part A — Backend (`server/`)

### A1. Project tooling ⭐
- [ ] `tsconfig.json` path aliases: `@config/*`, `@common/*`, `@database/*`, `@infra/*`, `@modules/*`
- [ ] ESLint (typescript-eslint, import order, no-console, no-restricted-imports for `mongoose` ObjectId)
- [ ] Prettier config shared with frontends (`.prettierrc` at repo root)
- [ ] Husky + lint-staged (lint, format, `scripts/check-rules.sh` on staged files)
- [ ] Commitlint (conventional commits)
- [ ] `.env.example` with every variable documented
- [ ] Local MongoDB via `MONGODB_URI` in `server/.env` (inspect with MongoDB Compass). Transactions need a replica set — enable one locally before the checkout phase
- [ ] Later (deployment phase): `Dockerfile` (multi-stage) for API and worker, optional `docker-compose.yml`
- [ ] npm scripts: `start:dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `seed`, `migrate`, `gen:swagger-json`

### A2. Config (`src/config/`) ⭐
- [ ] `env.validation.ts` — Joi/Zod schema validating every env var at boot; app refuses to start on invalid config 🧪
- [ ] `app.config.ts` — name, env, port, apiPrefix (`api`), version (`v1`), timezone (`Asia/Kolkata`), frontend URLs
- [ ] `database.config.ts` — uri, dbName, pool size, retry, `autoIndex` (off in prod)
- [ ] `auth.config.ts` — access/refresh secrets, TTLs, bcrypt/argon2 cost, OTP length/TTL, max sessions
- [ ] `cors.config.ts` — allowed origins list (public + admin), credentials
- [ ] `throttle.config.ts` — default limits, auth limits, OTP limits
- [ ] `swagger.config.ts` — title, description, version, enabled flag, basic-auth guard for prod
- [ ] `redis.config.ts`, `queue.config.ts` — host, port, prefix, default job options
- [ ] `storage.config.ts` — provider (cloudinary | s3), bucket, folder, max sizes, allowed mime types
- [ ] `payment.config.ts` — provider keys, webhook secret, currency `INR`
- [ ] `notification.config.ts` — SMS provider, email provider, push keys, sender ids
- [ ] `business.config.ts` — default commission (basis points), reservation TTL, slot length, weight variance %, min order
- [ ] `config.module.ts` — registers all namespaces with `registerAs`, global
- [ ] `app-config.service.ts` — typed getters (`config.auth.accessTtl`), the only way to read config

### A3. Bootstrap (`src/bootstrap/`) ⭐
- [ ] `setup-app.ts` — calls each setup below in order (keeps `main.ts` ~15 lines)
- [ ] `setup-security.ts` — helmet, cors, compression, trust proxy, body size limits
- [ ] `setup-versioning.ts` — global prefix `/api`, URI versioning `v1`
- [ ] `setup-pipes.ts` — global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`, implicit conversion off)
- [ ] `setup-swagger.ts` — DocumentBuilder, bearer auth, tags, write `swagger.json` for frontend type generation
- [ ] `setup-shutdown.ts` — `enableShutdownHooks`, graceful close of Mongo/Redis/queues

### A4. IDs (UUID — never ObjectId) ⭐
- [ ] `common/utils/id.util.ts` — `generateId()` → UUID **v7** (time-ordered, index-friendly) 🧪
- [ ] `common/utils/id.util.ts` — `isUuid(value)` 🧪
- [ ] `common/decorators/uuid-param.decorator.ts` — `@UuidParam('id')` = `@Param(name, new ParseUUIDPipe({ version: '7' }))`
- [ ] `common/dto/id-param.dto.ts` — `IdParamDto { @IsUUID('7') id }`
- [ ] `common/validators/is-uuid-array.validator.ts` — for bulk ops
- [ ] `common/utils/reference-number.util.ts` — human codes: `ORD-261023-7K3F`, `SET-…`, `TKT-…`, `REF-…` 🧪
- [ ] `database/schemas/counter.schema.ts` + `CounterService.next(name)` — atomic sequence if numeric codes needed

### A5. Database layer (`src/database/`) ⭐
- [ ] `base.schema-options.ts` — `timestamps: true`, `versionKey: false`, `id: false`, `toJSON`/`toObject` transform `_id → id`
- [ ] `base.entity.ts` — `_id: string` (default `generateId`), `createdAt`, `updatedAt`; all schemas extend it
- [ ] `create-schema.util.ts` — `createSchema(Class)` = `SchemaFactory.createForClass` + base plugins applied
- [ ] `plugins/soft-delete.plugin.ts` — `deletedAt`, `deletedBy`, auto-filter in find queries 🧪
- [ ] `plugins/audit-fields.plugin.ts` — `createdBy`, `updatedBy` (UUID strings)
- [ ] `base.repository.ts` — generic `BaseRepository<T>`: `findById`, `findByIdOrThrow`, `findOne`, `findMany`, `paginate`, `create`, `createMany`, `updateById`, `updateOne`, `softDelete`, `restore`, `exists`, `count`, `aggregate`; every method accepts an optional `session` 🧪
- [ ] `transaction.helper.ts` — `runInTransaction(connection, fn)` with retry on transient errors 🧪
- [ ] `query/filter-builder.ts` — build Mongo filter from query DTO with field whitelist 🧪
- [ ] `query/sort-builder.ts` — `sort=-createdAt,name` → Mongo sort, whitelisted fields only 🧪
- [ ] `query/search.util.ts` — `escapeRegex`, case-insensitive prefix search, text-index search 🧪
- [ ] `query/projection.util.ts` — reusable `select` presets (public vs owner vs admin)
- [ ] `geo/geo-point.schema.ts` — embedded `{ type: 'Point', coordinates: [lng, lat] }` with 2dsphere index helper
- [ ] `constants/collection-names.ts` — every collection name in one enum
- [ ] `seeds/` — seed runner + seeders: roles/permissions, admin user, categories, TN districts, demo shop
- [ ] `migrations/` — migrate-mongo setup for index/data migrations

### A6. Common DTOs (`src/common/dto/`) ⭐
- [ ] `pagination-query.dto.ts` — `page`, `limit` (max cap from config), defaults
- [ ] `sort-query.dto.ts` — `sort` string
- [ ] `search-query.dto.ts` — `q`
- [ ] `list-query.dto.ts` — composes pagination + sort + search (most list endpoints extend this)
- [ ] `date-range-query.dto.ts` — `from`, `to` (IST aware), validated `from <= to`
- [ ] `geo-query.dto.ts` — `lat`, `lng`, `radiusKm`
- [ ] `paginated-response.dto.ts` — `PaginatedResponseDto<T>` `{ items, meta: { page, limit, total, totalPages, hasNext } }`
- [ ] `api-response.dto.ts` — envelope `{ success, data, message?, meta? }`
- [ ] `error-response.dto.ts` — `{ success: false, error: { code, message, details?, requestId } }`
- [ ] `money.dto.ts`, `quantity.dto.ts` — reusable validated value objects
- [ ] `address.dto.ts` — line1, line2, locality, city, district (enum), pincode, coordinates

### A7. Custom validators & transformers (`src/common/validators`, `transformers`)
- [ ] `@IsIndianPhone()` (+91, 10 digits, starts 6–9) 🧪
- [ ] `@IsPincode()` (6 digits, TN range optional) 🧪
- [ ] `@IsPaise()` — positive integer money 🧪
- [ ] `@IsGrams()` — positive integer, optional step (e.g. 250 g) 🧪
- [ ] `@IsTimeHHmm()` — business hours 🧪
- [ ] `@IsDistrict()` — Tamil Nadu district enum
- [ ] `@IsAfter(field)` — date ordering
- [ ] `@Trim()`, `@ToLowerCase()`, `@ToInt()`, `@ToBoolean()`, `@ToArray()` transformers 🧪
- [ ] `@NormalizePhone()` transformer → E.164

### A8. Decorators (`src/common/decorators/`) ⭐
- [ ] `@Public()` — skip auth
- [ ] `@Auth(...roles)` — composite: JwtGuard + RolesGuard + `@ApiBearerAuth` + 401/403 Swagger responses
- [ ] `@Roles(...)`, `@Permissions(...)`
- [ ] `@CurrentUser()` / `@CurrentUser('id')`
- [ ] `@CurrentShop()` — resolves the vendor's shop from auth context (never from body)
- [ ] `@UuidParam()` (see A4)
- [ ] `@IdempotencyKey()` — reads `Idempotency-Key` header
- [ ] `@ApiStandardResponses()` — 400/401/403/404/409/422/500 with `ErrorResponseDto`
- [ ] `@ApiOkEnvelope(Dto)` / `@ApiCreatedEnvelope(Dto)` — wraps DTO in envelope schema
- [ ] `@ApiPaginatedResponse(Dto)` — paginated envelope schema
- [ ] `@ApiListQuery()` — documents page/limit/sort/q
- [ ] `@Audit(action, entityType)` — marks handler for audit interceptor
- [ ] `@SkipEnvelope()` — for file downloads / webhooks

### A9. Guards (`src/common/guards/`) ⭐
- [ ] `jwt-auth.guard.ts` — global, respects `@Public()`
- [ ] `roles.guard.ts`
- [ ] `permissions.guard.ts`
- [ ] `shop-ownership.guard.ts` — resource's `shopId` must belong to current vendor 🧪
- [ ] `resource-owner.guard.ts` — generic owner check (customer → own orders/addresses) 🧪
- [ ] `vendor-approved.guard.ts` — blocks unapproved/suspended vendors from selling actions
- [ ] `throttler` setup with per-route overrides (login, OTP)
- [ ] `webhook-signature.guard.ts` — verifies payment provider signature 🧪

### A10. Interceptors, filters, pipes, middleware ⭐
- [ ] `response-envelope.interceptor.ts` — wraps all responses
- [ ] `logging.interceptor.ts` — method, path, status, duration, userId, requestId
- [ ] `timeout.interceptor.ts`
- [ ] `idempotency.interceptor.ts` — stores response by key+user for N hours (checkout, payments) 🧪
- [ ] `audit.interceptor.ts` — writes audit log for `@Audit` handlers
- [ ] `all-exceptions.filter.ts` — single error shape, hides internals in prod 🧪
- [ ] `mongo-exception.filter.ts` — duplicate key 11000 → 409 with field name 🧪
- [ ] Validation error formatter → `{ field, message }[]` in `details`
- [ ] `request-id.middleware.ts` — `X-Request-Id` in/out, stored in async context
- [ ] `parse-sort.pipe.ts`, `parse-date-ist.pipe.ts`

### A11. Errors (`src/common/exceptions/`) ⭐
- [ ] `error-codes.enum.ts` — `AUTH_INVALID_CREDENTIALS`, `SHOP_CLOSED`, `OUT_OF_STOCK`, `INVALID_STATUS_TRANSITION`, `PAYMENT_SIGNATURE_INVALID`, ...
- [ ] `app.exception.ts` — `AppException(code, message?, status?, details?)`
- [ ] Shortcuts: `NotFoundAppException(entity, id)`, `ConflictAppException`, `ForbiddenAppException`, `BusinessRuleException`
- [ ] `assert.util.ts` — `assertFound(doc, entity)`, `assertOwner(doc, userId)`, `assertCondition(cond, code)` 🧪

### A12. Constants & enums (`src/common/constants/`, `enums/`) ⭐
- [ ] `role.enum.ts` — `CUSTOMER`, `VENDOR_OWNER`, `VENDOR_STAFF`, `DELIVERY_PARTNER`, `ADMIN`, `OPERATIONS`, `SUPPORT`, `FINANCE`
- [ ] `permission.enum.ts` + `role-permissions.map.ts`
- [ ] `order-status.enum.ts`, `payment-status.enum.ts`, `refund-status.enum.ts`, `delivery-status.enum.ts`
- [ ] `vendor-verification-status.enum.ts`, `shop-status.enum.ts` (`OPEN`, `CLOSED`, `PAUSED`)
- [ ] `unit.enum.ts` — `GRAM`, `PIECE`; `sell-mode.enum.ts` — `FIXED_WEIGHT`, `VARIABLE_WEIGHT`, `PIECE`
- [ ] `meat-category.enum.ts`, `cut-type.enum.ts`, `preparation-option.enum.ts` (cleaning, skin on/off)
- [ ] `inventory-movement-type.enum.ts` — `OPENING`, `RECEIVED`, `RESERVED`, `RELEASED`, `SOLD`, `WASTAGE`, `ADJUSTMENT`, `RETURNED`
- [ ] `ledger-entry-type.enum.ts` — `SALE`, `COMMISSION`, `DELIVERY_FEE`, `REFUND`, `ADJUSTMENT`, `PAYOUT`, `REVERSAL`
- [ ] `payment-method.enum.ts` — `COD`, `UPI`, `CARD`, `NETBANKING`
- [ ] `tn-districts.constant.ts` — all 38 Tamil Nadu districts (code, en, ta)
- [ ] `queue-names.constant.ts`, `event-names.constant.ts`, `cache-keys.constant.ts`, `swagger-tags.constant.ts`
- [ ] `regex.constant.ts` — phone, pincode, HH:mm, slug
- [ ] `limits.constant.ts` — max images per product, max cart items, max addresses

### A13. Utilities (`src/common/utils/`) — pure functions, all 🧪
- [ ] **money**: `toPaise(rupees)`, `fromPaise(paise)`, `formatINR(paise)`, `addMoney(...)`, `applyBasisPoints(amount, bps)`, `splitProportionally(total, parts)` (no lost paise), `roundPaise`
- [ ] **quantity**: `gramsToKg`, `kgToGrams`, `formatWeight(grams)` (`750 g`, `1.5 kg`), `priceForGrams(pricePerKgPaise, grams)`, `isWithinVariance(target, actual, pct)`, `isValidStep(grams, step)`
- [ ] **date (IST)**: dayjs with tz plugin set to `Asia/Kolkata`; `nowIST`, `startOfDayIST`, `endOfDayIST`, `toISTString`, `isWithinHours(hours, at)`, `generateSlots(open, close, minutes)`, `addMinutes`, `isExpired`
- [ ] **string**: `slugify`, `normalizePhone`, `maskPhone`, `maskEmail`, `titleCase`, `truncate`, `randomCode(len, alphabet)`
- [ ] **crypto**: `hashToken` (sha256), `safeCompare` (timingSafeEqual), `generateOtp(len)`, `hmacSha256(payload, secret)`
- [ ] **password**: `hashPassword`, `verifyPassword` (argon2)
- [ ] **object**: `pick`, `omit`, `compact` (remove undefined/null), `deepFreeze`
- [ ] **array**: `chunk`, `groupBy`, `uniqBy`, `keyBy`, `sumBy`
- [ ] **geo**: `toGeoPoint(lat, lng)`, `haversineKm(a, b)`, `isWithinRadius`
- [ ] **pagination**: `getSkip(page, limit)`, `buildPaginationMeta(total, page, limit)`
- [ ] **async**: `sleep`, `retry(fn, { attempts, backoff })`, `withTimeout`
- [ ] **state machine**: `createStateMachine<S>(transitions)` → `canTransition`, `assertTransition`, `nextStates` (used by order, payment, refund, delivery, vendor verification)

### A14. Auth building blocks (`src/modules/auth/`) ⭐
- [ ] `TokenService` — sign/verify access & refresh, token family, rotation, reuse detection 🧪
- [ ] `SessionService` — store hashed refresh tokens, revoke one / all, TTL index
- [ ] `OtpService` — generate, hash, verify, attempt limits, resend cooldown 🧪
- [ ] `JwtStrategy` — payload `{ sub, role, permissions, shopId? }`
- [ ] `AuthUser` interface used everywhere (`@CurrentUser()` type)

### A15. Infrastructure adapters (`src/infra/`) — interface + provider swap
- [ ] **logger**: nestjs-pino, pretty in dev, JSON in prod, redaction of tokens/passwords/phones, requestId binding ⭐
- [ ] **events**: `@nestjs/event-emitter`, typed event payload classes per event name
- [ ] **cache**: `CacheService` (get/set/del/wrap) + key builder functions + TTL constants
- [ ] **queue**: BullMQ module registration helper, `BaseProcessor` (logging, retries, failure hook), default job options
- [ ] **storage**: `StorageService` interface → `CloudinaryStorage` / `S3Storage`; `uploadImage`, `uploadDocument`, `delete`, `signedUrl`
- [ ] **file validation**: `ParseFilePipe` preset (mime + size), `@UploadImages(max)` decorator
- [ ] **sms**: `SmsService` interface (OTP, order updates) + provider + console provider for dev
- [ ] **email**: `MailService` interface + template renderer
- [ ] **push**: `PushService` interface (FCM/Web Push)
- [ ] **payment**: `PaymentProvider` interface (`createOrder`, `verifySignature`, `refund`, `fetchPayment`) → Razorpay adapter
- [ ] **maps** (later): `GeocodingService` interface
- [ ] **health**: Terminus checks for Mongo, Redis, disk, memory ⭐

### A16. Domain helpers shared across modules
- [ ] `PricingService` — line total, delivery fee rules, coupon discount, tax, commission; one place for all money math 🧪
- [ ] `InventoryService.reserve/release/commit` — atomic `findOneAndUpdate` with `availableQty >= qty` condition + movement log 🧪
- [ ] `LedgerService.post(entries[])` — append-only, balanced entries, reversal instead of edit 🧪
- [ ] `OrderSnapshot` builder — copies product name, variant, price, options into order item 🧪
- [ ] `AuditService.log(actor, action, entity, before?, after?)`
- [ ] `NotificationDispatcher.send(userId, type, payload)` — picks channels from user prefs + templates
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
- [ ] Generator script or Nest schematic that creates this structure

### A18. Testing helpers (`server/test/`)
- [ ] `create-test-app.ts` — boots app with in-memory Mongo **replica set** (mongodb-memory-server)
- [ ] `factories/` — `userFactory`, `vendorFactory`, `shopFactory`, `productFactory`, `orderFactory` (UUID ids)
- [ ] `auth.helper.ts` — `loginAs(role)` → bearer token
- [ ] `db.helper.ts` — `clearDatabase()`
- [ ] Supertest request wrapper that unwraps the envelope

---

## Part B — Frontend (`public/` and `admin/` — same structure in both)

### B1. Project tooling ⭐
- [ ] Vite path alias `@/` → `src/`, mirrored in `tsconfig`
- [ ] ESLint (react, react-hooks, jsx-a11y, import order) + Prettier with `prettier-plugin-tailwindcss`
- [ ] Husky + lint-staged + `scripts/check-rules.sh`
- [ ] `npm run gen:api` — `openapi-typescript` from `server/swagger.json` → `src/types/api.generated.ts`
- [ ] Vitest + React Testing Library + MSW setup
- [ ] `.env.example`

### B2. Config (`src/config/`) ⭐
- [ ] `env.ts` — Zod-validated `import.meta.env` (API URL, app name, default locale, map keys); the only env reader
- [ ] `app.config.ts` — app name, support phone, default page size, upload limits, currency, timezone
- [ ] `routes.ts` — every route path as a constant + `buildPath(route, params)` helper
- [ ] `nav.config.ts` (admin) — sidebar items per role with permission keys

### B3. Theme & design tokens (`src/styles/theme.css`) ⭐
- [ ] `@theme` clears radius namespace and defines only `--radius-md` → `rounded-lg/xl` cannot be generated
- [ ] `@theme` clears `--shadow-*`, `--inset-shadow-*`, `--drop-shadow-*`, `--text-shadow-*` → no shadow utilities exist
- [ ] Semantic color tokens: `background`, `surface`, `surface-muted`, `border`, `text`, `text-muted`, `primary`, `primary-foreground`, `success`, `warning`, `danger`, `info` (+ `-soft` backgrounds)
- [ ] Dark mode token overrides
- [ ] Fonts: Inter + Noto Sans Tamil; type scale tokens
- [ ] Focus ring token (`ring-2 ring-primary/40`) — the accessible replacement for shadow-based focus
- [ ] z-index scale tokens (dropdown, sticky, overlay, modal, toast)

### B4. Core lib (`src/lib/`) ⭐
- [ ] `cn.ts` — `clsx` + `tailwind-merge` 🧪
- [ ] `api-client.ts` — Axios instance, base URL from env, `withCredentials`, timeout
- [ ] `api-interceptors.ts` — attach token, refresh-on-401 with request queue (single refresh in flight), unwrap envelope, normalize errors
- [ ] `api-error.ts` — `ApiError` class + `getErrorMessage(err)` + `getFieldErrors(err)` 🧪
- [ ] `http.ts` — typed `get<T>`, `post<T>`, `patch<T>`, `del<T>`, `getPaginated<T>`
- [ ] `query-client.ts` — TanStack Query defaults (staleTime, retry rules: no retry on 4xx)
- [ ] `i18n.ts` — react-i18next, `en` + `ta` namespaces, language persistence
- [ ] `storage.ts` — safe `localStorage` wrapper (try/catch, JSON, versioned keys)
- [ ] `logger.ts` — dev-only console wrapper (no raw `console.log` in code)

### B5. UI primitives (`src/components/ui/`) — `rounded-md`, no shadow, `cva` variants ⭐
- [ ] `Button` (variants: primary, secondary, outline, ghost, danger, link; sizes; `loading`, `leftIcon`, `rightIcon`, `fullWidth`)
- [ ] `IconButton`
- [ ] `Input`, `Textarea`, `NumberInput`, `PasswordInput`, `PhoneInput` (+91 prefix), `OtpInput`
- [ ] `Select`, `Combobox` (searchable), `MultiSelect`
- [ ] `Checkbox`, `Radio`, `RadioGroup`, `Switch`
- [ ] `Label`, `HelperText`, `ErrorText`
- [ ] `Card` (`CardHeader`, `CardBody`, `CardFooter`) — border + surface, no shadow
- [ ] `Badge`, `StatusBadge` (maps any status enum → tone via config), `Chip` / `FilterChip`
- [ ] `Avatar` (rounded-full exception), `AvatarGroup`
- [ ] `Spinner`, `Skeleton`, `ProgressBar`
- [ ] `Alert` / `Banner`, `Toast` (sonner or custom), `EmptyState`, `ErrorState`
- [ ] `Modal` / `Dialog`, `ConfirmDialog`, `Drawer` / `Sheet`
- [ ] `DropdownMenu`, `Popover`, `Tooltip` (Radix / Headless UI base, our styling)
- [ ] `Tabs`, `Accordion`, `Stepper`, `Timeline` (order status history)
- [ ] `Breadcrumbs`, `Divider`, `Kbd`, `CopyButton`, `Link`
- [ ] `Image` (lazy, aspect ratio, fallback), `ImageGallery`
- [ ] `Rating` (display + input)
- [ ] `DatePicker`, `DateRangePicker`, `TimePicker`, `TimeRangeInput` (business hours)
- [ ] `FileUpload`, `ImageUploader` (preview, reorder, remove, size/mime check)
- [ ] `SearchInput` (debounced, clear button)
- [ ] `Icon` — single re-export point for `lucide-react` icons
- [ ] `index.ts` barrel

### B6. Domain display components (`src/components/domain/`)
- [ ] `PriceText` (paise → ₹, strike-through MRP), `PricePerKg`
- [ ] `WeightText` (grams → `500 g` / `1.5 kg`)
- [ ] `WeightSelector` (preset 250/500/1000 g + custom step) and `QuantityStepper`
- [ ] `OrderStatusBadge`, `PaymentStatusBadge`, `VerificationStatusBadge`
- [ ] `OrderTimeline`
- [ ] `ShopOpenIndicator` (open / closed / opens at)
- [ ] `AddressCard`, `AddressText`
- [ ] `DeliverySlotPicker`
- [ ] `ProductCard`, `ShopCard` (used in both list and search results)
- [ ] `DistanceText`, `EtaText`

### B7. Data display (`src/components/data/`)
- [ ] `DataTable<T>` — columns config, sorting, row selection, loading/empty/error states, row actions, responsive (cards on mobile)
- [ ] `Pagination` (+ page size select), `InfiniteList` (intersection observer)
- [ ] `FilterBar` — config-driven filters synced to URL
- [ ] `StatCard` / `KpiTile`, `KpiRow`
- [ ] `Chart` wrapper (Recharts) — `LineChart`, `BarChart`, `DonutChart` with theme colors
- [ ] `DescriptionList` (key/value detail view)
- [ ] `ExportButton` (CSV)

### B8. Layout (`src/components/layout/`) ⭐
- [ ] `AppShell`, `Sidebar` (config-driven, permission-aware), `Topbar`, `MobileBottomNav` (storefront)
- [ ] `PageHeader` (title, description, breadcrumbs, actions slot)
- [ ] `PageContainer`, `Section`, `Stack`, `Inline`, `Grid`
- [ ] Layouts: `AuthLayout`, `CustomerLayout` (public), `VendorLayout`, `AdminLayout`, `DeliveryLayout` (admin app)
- [ ] `ErrorBoundary` + `RouteErrorPage`, `NotFoundPage`, `ForbiddenPage`, `MaintenancePage`
- [ ] `PageLoader` (Suspense fallback)

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
- [ ] **format**: `formatINR(paise)`, `formatWeight(grams)`, `formatDateIST`, `formatTimeIST`, `formatRelative`, `formatPhone`, `maskPhone`, `formatDistance`, `formatFileSize`, `pluralize`
- [ ] **string**: `truncate`, `initials`, `slugify`, `titleCase`
- [ ] **url**: `toQueryString(params)` (skips empty), `parseQueryString`
- [ ] **status**: `getStatusTone(enum, value)`, `getStatusLabel(enum, value)` from one status config map
- [ ] **file**: `validateFile(file, rules)`, `readAsDataUrl`
- [ ] **money/quantity**: same math as backend (`priceForGrams`, `kgToGrams`) — mirror the backend tests

### B15. Constants & types (`src/constants/`, `src/types/`)
- [ ] Enums mirrored from generated API types (roles, statuses, units, categories) — never retyped by hand
- [ ] `status-config.ts` — label key + tone for every status enum
- [ ] `tn-districts.ts`
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
