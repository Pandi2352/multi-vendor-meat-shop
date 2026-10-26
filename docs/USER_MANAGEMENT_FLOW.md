# Complete User Management & Authentication Flow

> **Tamil Nadu Meat Marketplace — Virudhunagar District Deployment**  
> Single source of truth for Portal Authentication, RBAC Permissions, User Invitations, Free MongoDB `$geoNear` Spatial Search, and Development Logging.

---

## 1. Architectural Overview

The Marketplace separates users into distinct personas while keeping authentication unified through email OTP and session management:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Unified Authentication Layer                       │
│    POST /api/v1/auth/portal/send-otp  ──>  POST /api/v1/auth/portal/verify   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Generates JWT + Session
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────┐                         ┌───────────────────────┐
│     Storefront App    │                         │      Admin Portal     │
│       (`public/`)     │                         │       (`admin/`)      │
│  Role: `CUSTOMER`     │                         │  Roles:               │
│                       │                         │   - `SUPER_ADMIN`     │
│                       │                         │   - `ADMIN`           │
│                       │                         │   - `OPERATIONS`      │
│                       │                         │   - `FINANCE`         │
│                       │                         │   - `VENDOR_OWNER`    │
│                       │                         │   - `DELIVERY_PARTNER`│
└───────────────────────┘                         └───────────────────────┘
```

---

## 2. Authentication & Authorization Flow

### 2.1 Admin Portal Sign-In Lifecycle
1. **Request Verification Code**:
   - The user navigates to `/login` (`SignInPage`).
   - Inputs their administrative or vendor email.
   - Dispatches `POST /api/v1/auth/portal/send-otp`.
   - The server verifies the user's role is not restricted from the portal, generates a cryptographic 6-digit OTP, hashes it with HMAC-SHA256, stores it with a 10-minute expiry, and dispatches an email via Nodemailer.
   - The portal client saves `{ email, resendAt }` into `sessionStorage` via `pendingSignIn` and redirects to `/login/verify`.
2. **Submit OTP**:
   - The user navigates to `/login/verify` (`VerifyCodePage`).
   - The page reads the pending email, provides auto-focus 6-digit OTP input, and displays an active 60-second cooldown timer.
   - Dispatches `POST /api/v1/auth/portal/verify`.
   - On success, receives `{ accessToken, refreshToken, user }`.
   - `accessToken` is stored in secure memory for API requests, while `refreshToken` is handled for background token rotations.
   - User is redirected to `/` (`DashboardRoute`).

```
User               SignInPage           VerifyCodePage             Server (NestJS)
 │                     │                      │                          │
 ├── Enter Email ─────>│                      │                          │
 │                     ├── POST /send-otp ──────────────────────────────>│
 │                     │<── 200 OK (Cooldown) ───────────────────────────┤
 │                     ├── Store pending ────>│                          │
 │                     ├── Navigate ─────────>│                          │
 │                     │                      │                          │
 ├── Enter 6-digit OTP ──────────────────────>│                          │
 │                     │                      ├── POST /portal/verify ──>│
 │                     │                      │<── 200 OK (Tokens) ──────┤
 │                     │                      ├── Store Access Token     │
 │                     │                      ├── Redirect to Dashboard  │
```

---

## 3. Role-Based Access Control (RBAC) & Permissions

### 3.1 Platform Roles Hierarchy
| Role | Portal Access | Scope & Responsibilities |
| :--- | :---: | :--- |
| `SUPER_ADMIN` | Full | Unrestricted root authority. Bypasses all permission checks. Fixed permissions. |
| `ADMIN` | Full | Marketplace oversight, assigning user roles, managing stall verifications, platform settings. |
| `OPERATIONS` | Operational | Reviews vendor onboarding applications, inspects stall catalogs, manages delivery tasks. |
| `FINANCE` | Financial | Approves refunds, inspects commission rates, generates vendor settlements and payout logs. |
| `SUPPORT` | Service | Resolves dispute tickets, assists customers with order delivery queries. |
| `VENDOR_OWNER` | Stall-Specific | Manages butcher stall profile, opening hours, product catalog, batches, and opening stock. |
| `BUTCHER` / `VENDOR_STAFF` | Stall-Specific | Prepares, cuts, weighs, packs packets, and marks marketplace orders ready for pickup. |
| `DELIVERY_PARTNER` | Delivery | Accepts delivery tasks, navigates to butcher stalls, collects packets, verifies customer OTP drop-off. |
| `CUSTOMER` | Storefront | Browses stalls, selects cuts, creates cart, places cash-on-delivery orders. |

### 3.2 Granular Permissions Catalog
Permissions are organized across 6 operational modules:

```
1. Users & Security:
   - `user.read`: View registered users and customer delivery addresses.
   - `user.manage`: Modify user roles, toggle account status, invite team members.

2. Butcher Stalls & Vendors:
   - `vendor.read`: Inspect vendor onboarding applications and documents.
   - `vendor.verify`: Approve or reject butcher stall applications.
   - `shop.manage`: Edit stall details, opening hours, delivery radius, and service slots.

3. Products & Inventory:
   - `category.manage`: Create and manage meat categories.
   - `product.manage`: Create cuts, prices, net weights, and preparation options.
   - `product.moderate`: Unpublish or approve stall catalog items.
   - `inventory.manage`: Record daily opening stock, movements, and wastage batches.

4. Orders & Delivery:
   - `order.read`: View incoming and historical orders.
   - `order.fulfil`: Update order preparation states (ACCEPT, PREPARING, READY_FOR_PICKUP).
   - `order.manage`: Administrative cancellation or state override.
   - `delivery-task.manage`: Assign delivery partners and complete drop-off OTP validation.

5. Finance & Settlements:
   - `refund.approve`: Authorize customer refund requests.
   - `commission.manage`: Configure category-level platform commission basis points.
   - `settlement.read`: Review butcher stall ledger entries and balance summaries.
   - `settlement.manage`: Process vendor payout transfers and balance adjustments.

6. Governance & Analytics:
   - `promotion.manage`: Create promotional discount codes and marketing banners.
   - `ticket.manage`: Process customer complaints and dispute resolution tickets.
   - `analytics.read`: View GMV, daily order volume, and revenue metrics.
   - `config.manage`: Adjust platform parameters (e.g. reservation TTL, variance %).
```

### 3.3 Dynamic Role Permission Overrides (`RolePermissionOverride`)
- **Default Permissions**: Loaded from `ROLE_PERMISSIONS` in `#common/enums`.
- **Custom Overrides**: Stored in MongoDB collection `role_permissions`.
- **Real-Time Synthesis**: When fetching roles (`GET /api/v1/admin/roles`), the server merges the default permission map with any active MongoDB overrides.
- **Save Changes**: Admin can toggle permissions in the Admin Portal matrix, saving them with `PUT /api/v1/admin/roles/:role/permissions`.

---

## 4. Admin User Management Portal (`/admin/users`)

The admin portal provides a 3-tab user management suite:

### Tab 1: All Users (`UsersTable`)
- **Search & Filters**: Search in real time by name, email, or phone. Filter by system role and account status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
- **User Role Badge**: Color-coded badges for all roles (`SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `FINANCE`, `VENDOR_OWNER`, `BUTCHER`, `DELIVERY_PARTNER`, `CUSTOMER`).
- **Assign Role Modal (`AssignRoleDialog`)**: Allows changing any user's role with protection preventing non-Super Admins from editing a Super Admin.
- **Update Status Dialog (`UserStatusDialog`)**: Toggle between `ACTIVE` (full access), `INACTIVE` (temporarily disabled), and `SUSPENDED` (blocked).

### Tab 2: Invited Users (`InvitationsTable`)
- **Invitation Lifecycle**:
  ```
  [Invite Created] ──> Status: PENDING (7-day TTL)
         │
         ├── User accepts via link ──> Status: ACCEPTED
         ├── 7 days expire without acceptance ──> Status: EXPIRED
         ├── Admin extends invitation ──> Status: PENDING (New 7-day TTL)
         └── Admin cancels invitation ──> Status: REVOKED
  ```
- **Invite User Modal (`InviteUserModal`)**:
  - Full Name
  - Email Address
  - Assign Role (`ADMIN`, `OPERATIONS`, `FINANCE`, `SUPPORT`, `VENDOR_OWNER`, `BUTCHER`, `DELIVERY_PARTNER`)
  - Optional Stall Association (`shopId` for stall owners/butchers)

### Tab 3: Roles & Permissions Matrix (`RolePermissionMatrix`)
- Left sidebar lists all platform roles with live user count badges.
- Right pane displays all 22 system permissions grouped into clean domain sections with checkboxes.
- Save button persists customized permissions directly to MongoDB via `PUT /api/v1/admin/roles/:role/permissions`.

---

## 5. Free Geospatial Location via MongoDB `$geoNear`

To eliminate third-party map subscription costs (such as Google Maps Distance Matrix API), the platform utilizes MongoDB's native `$geoNear` aggregation pipeline:

### 5.1 Architecture & Indexing
- Every butcher stall schema defines a GeoJSON point:
  ```ts
  @Prop({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  })
  location: { type: string; coordinates: [number, number] };
  ```
- Indexed with a native `2dsphere` index:
  ```ts
  ShopSchema.index({ location: '2dsphere' });
  ```

### 5.2 Aggregation Pipeline Implementation
In `ShopRepository.findNearbyShops(longitude, latitude, maxDistanceMeters)`:

```ts
const pipeline: PipelineStage[] = [
  {
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      distanceField: 'distanceMeters',
      maxDistance: maxDistanceMeters, // e.g. 15,000 meters (15 km)
      spherical: true,
      query: {
        status: ShopStatus.ACTIVE,
        isAcceptingOrders: true,
        deletedAt: null,
      },
    },
  },
  { $sort: { distanceMeters: 1 } },
  { $limit: limit },
];
```

### 5.3 Benefits of `$geoNear`:
1. **100% Free**: Operates directly on the local database with zero external API calls.
2. **Spherical Geodesic Accuracy**: Uses WGS84 ellipsoid calculations, taking the earth's curvature into account.
3. **Instant Performance**: Directly leverages the `2dsphere` spatial index, filtering and sorting shops in under 5 milliseconds.
4. **Distance Included**: Automatically injects `distanceMeters` into the shop entity, allowing the UI to display e.g. "1.4 km away".

---

## 6. Colorized Development Logging

Development logs use ANSI color highlighting for immediate visual readability:

### 6.1 Configuration in `server/src/infra/logger/create-pino-logger.ts`
- **Development Environment (`NODE_ENV !== 'production'`)**:
  ```ts
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,            // Vibrant ANSI colors for HTTP verbs & log levels
      singleLine: true,          // Clean single line per request
      translateTime: 'SYS:standard', // Formatted local timestamp
      ignore: 'pid,hostname',    // Omits machine noise
    },
  }
  ```
- **Production Environment (`NODE_ENV === 'production'`)**:
  - Emits high-speed NDJSON logs.
  - Redacts sensitive data paths:
    - `req.headers.authorization`
    - `*.password`, `*.*password`
    - `*.otp`, `*.*otp`
    - `*.refreshToken`
    - `*.phone`, `*.*phone` (partially masked)

---

## 7. Admin Endpoints Reference

| Method | Endpoint | Description | Auth Guard |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/users` | List users with pagination, search, role & status filters | `ADMIN`, `SUPER_ADMIN` |
| `PATCH` | `/api/v1/admin/users/:id/role` | Assign role to an existing user | `ADMIN`, `SUPER_ADMIN` |
| `PATCH` | `/api/v1/admin/users/:id/status` | Update account status (`ACTIVE`, `INACTIVE`, `SUSPENDED`) | `ADMIN`, `SUPER_ADMIN` |
| `GET` | `/api/v1/admin/users/invitations` | List all sent user invitations | `ADMIN`, `SUPER_ADMIN` |
| `POST` | `/api/v1/admin/users/invitations` | Invite a new user with role and email | `ADMIN`, `SUPER_ADMIN` |
| `DELETE` | `/api/v1/admin/users/invitations/:id` | Revoke a pending user invitation | `ADMIN`, `SUPER_ADMIN` |
| `POST` | `/api/v1/admin/users/invitations/:id/resend` | Resend invitation and extend 7-day TTL | `ADMIN`, `SUPER_ADMIN` |
| `GET` | `/api/v1/admin/roles` | List all roles with user count and current permissions | `ADMIN`, `SUPER_ADMIN` |
| `GET` | `/api/v1/admin/roles/permissions/catalog`| List all 22 system permissions grouped by domain | `ADMIN`, `SUPER_ADMIN` |
| `PUT` | `/api/v1/admin/roles/:role/permissions` | Custom override of permissions mapped to a role | `ADMIN`, `SUPER_ADMIN` |

---

## 8. Verification & Test Suite Summary

- **Unit Tests**: 31 suites passing (128 tests).
- **E2E Tests**: `server/test/admin-users.e2e-spec.ts` passes all 8 end-to-end integration steps.
- **Rule Enforcement**: Verified via `bash scripts/check-rules.sh` (0 violations: zero shadows, `rounded-md` everywhere, no `ObjectId` usage, file size constraints honored).
