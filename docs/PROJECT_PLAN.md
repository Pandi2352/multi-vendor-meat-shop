# Tamil Nadu Meat Marketplace — Project Plan

A location-aware, multi-vendor meat ordering platform for Tamil Nadu. Customers find nearby meat shops, order by weight and track delivery. Shops run their catalogue, daily stock, orders and payouts from a vendor dashboard. Admins verify shops, set commissions and resolve disputes. Launch in one locality, expand district by district.

## 1. Users

| Role                | Needs                                                                         |
| ------------------- | ----------------------------------------------------------------------------- |
| Customer            | Find shops serving their address, compare, order by weight, pay, track, review |
| Vendor owner/staff  | Shop profile, products, daily stock, pricing, hours, accept/prepare orders, payouts |
| Delivery partner    | Assigned tasks, pickup/drop details, status updates, OTP proof, earnings     |
| Admin / Ops / Support / Finance | Verify vendors, moderate catalogue, commissions, refunds, disputes, reports |

## 2. Apps and stack

| Folder    | Contents                                               | Stack |
| --------- | ------------------------------------------------------ | ----- |
| `server/` | NestJS modular monolith, REST `/api/v1`, Swagger       | NestJS, TypeScript, MongoDB + Mongoose, class-validator, Pino, BullMQ + Redis (when needed) |
| `public/` | Customer storefront                                    | React, Vite, TypeScript, Tailwind v4, React Router, TanStack Query, RHF + Zod, Axios, Zustand, react-i18next |
| `admin/`  | Vendor dashboard, admin panel, delivery portal (role-based layouts) | Same as `public/` |

Supporting: JWT access + rotating refresh tokens, argon2, Cloudinary or S3 storage, Razorpay (UPI/card/netbanking) + COD, SMS OTP, Jest + Supertest, Vitest + RTL + MSW, Docker, CI/CD, managed MongoDB (replica set).

Fixed technical decisions:
- **UUID v7 string ids** for every document. No ObjectId.
- **Money in paise, weight in grams**, integers only.
- **One shop per cart** in v1. Multi-shop later = parent checkout + child order per shop.
- **Order items snapshot** product name, variant, price and options at purchase time.
- **Explicit state machines** for order, payment, refund, delivery, vendor verification.
- **Append-only ledger** for all money movement; corrections by reversal.

## 3. Feature modules

### A. Customer storefront (`public/`)
1. **Location & discovery** — detect/select address, browse by district/town/locality/PIN, filter by open now, rating, delivery availability; delivery ETA.
2. **Shop storefront** — photos, address, hours, contact, catalogue, offers, min order, delivery fee, ratings, in-shop search.
3. **Catalogue & search** — categories (chicken, country chicken, mutton, fish, others per vendor permission and local rules), cuts (curry cut, boneless, breast, leg, liver, mince), filters, price per kg, freshness and storage info.
4. **Cart & checkout** — grams/kg selection, cleaning/cutting preferences, address, instructions, scheduled slot, coupon, fee breakdown, COD + online, server-side stock and price revalidation.
5. **Orders** — confirmation, status timeline, cancellation request, refund tracking, reorder, receipt, history.
6. **Account** — phone OTP login, profile, addresses, favourites, recently viewed, verified-purchase reviews, notifications, offers, referrals, loyalty, support tickets.

### B. Vendor dashboard (`admin/`, vendor role)
7. **Registration & verification** — owner + shop details, service area, hours, FSSAI/licence documents, approve/reject/resubmit, suspension, expiry reminders.
8. **Catalogue** — create/edit/archive/duplicate products, images, variants, price per unit, min quantity, preparation options, daily specials, restricted products go to review.
9. **Fresh inventory** — daily opening stock, stock received, reservations, auto out-of-stock, batches with use-by, wastage, adjustments, low-stock alerts, movement history.
10. **Orders & preparation** — new-order alerts, accept/reject, preparation queue by promised time, cut/clean/pack instructions, status updates, **actual packed weight**, substitutions with customer consent.
11. **Analytics & settlements** — sales by day/week/month, by product/category, cancellations, AOV, best sellers, gross → commission → net, payout history, downloadable reports.
12. **Operations & promotions** — open/closed/paused, breaks, holidays, cut-off times, delivery slots, capacity per slot, coupons, discounts, featured products, staff accounts with permissions.

### C. Delivery (`admin/`, delivery role)
13. **Partners** — onboarding, approval, availability, service area, accept/reassign tasks, pickup verification, OTP proof of delivery, earnings, history.
14. **Orchestration** — fee rules, distance/serviceability checks, slot capacity, ETA, batching, late alerts, failed-delivery handling, live tracking later. v1 allows **vendor-managed delivery**.

### D. Admin (`admin/`, admin roles)
15. **Access control** — admin/ops/support/finance roles, permissions, audit logs, suspension, security review.
16. **Moderation** — vendor applications and documents, global categories and attributes, reported listings, supported locations.
17. **Commission & payments** — commission by vendor/category, payment records, gateway reconciliation, refunds, adjustments, settlement batches, finance exports.
18. **Support & disputes** — tickets with category/priority, quality/missing/late complaints, evidence attachments, internal notes, refund approval, escalation.
19. **Marketplace analytics** — GMV, platform revenue, refunds, active users per role, district-wise demand, vendor performance.
20. **Configuration & compliance** — fee/tax/commission defaults, notification templates, banners, languages (English/Tamil), licence renewal tracking, feature flags, maintenance mode, privacy requests.

## 4. Advanced engineering features
- **Variable-weight orders** — target weight, allowed variance %, actual packed weight, final price adjustment with prior customer consent.
- **Daily stock lifecycle** — opening, received, reserved, sold, wastage, close-out, all as movements.
- **Hyperlocal discovery** — `2dsphere` index on shop location, rank by distance, open status, ETA, rating.
- **Preparation capacity** — N orders per 15/30-minute slot, reserve on accept, release on cancel.
- **Settlement ledger** — every sale, commission, fee, refund, adjustment and payout is a ledger entry; vendor balance is reconcilable.

## 5. Backend modules

| Module | Responsibility |
| ------ | -------------- |
| Auth | OTP/password login, refresh rotation, sessions, recovery |
| Users | Profiles, account status |
| Roles | Roles, permissions |
| Vendors | Vendor profile, verification, documents |
| Shops | Shop profile, hours, status, slots, capacity |
| Locations | Addresses, districts, delivery zones, geo queries |
| Categories | Category tree, attributes |
| Products | Catalogue, variants, pricing, images |
| Inventory | Batches, movements, reservations |
| Cart | Single-shop cart |
| Checkout | Quote, revalidation, order creation |
| Orders | Lifecycle, events, vendor fulfilment |
| Payments | Gateway, webhooks, payment records |
| Pricing | Fees, discounts, tax, commission, weight adjustment |
| Delivery | Tasks, assignment, proof of delivery |
| Reviews | Verified-purchase reviews, moderation |
| Promotions | Coupons, campaigns, eligibility |
| Settlements | Ledger, balances, payout batches, reconciliation |
| Notifications | SMS, email, push, in-app |
| Support | Tickets, disputes, refunds workflow |
| Analytics | Aggregations, reports |
| Admin | Platform config, moderation |
| Audit | Audit trail |
| Health | Liveness, readiness |

MVP modules: Auth, Users, Roles, Vendors, Shops, Locations, Categories, Products, Inventory, Cart, Checkout, Orders, Payments (COD first), Pricing, Admin, Audit, Health.

## 6. Collections (all `_id` are UUID v7 strings)

| Collection | Key fields |
| ---------- | ---------- |
| users | name, phone, email, passwordHash, role, status |
| refresh_sessions | userId, tokenHash, familyId, expiresAt (TTL), revokedAt |
| roles | name, permissions |
| vendor_profiles | userId, legalName, verificationStatus, documents[], allowedCategories |
| shops | vendorId, name, slug, address, location (Point), hours, status, minOrderPaise, capacityPerSlot |
| delivery_zones | shopId, radiusKm or polygon, feeRules |
| categories | name, slug, parentId, status |
| products | shopId, categoryId, name, sellMode, variants[], pricePerKgPaise, status |
| inventory_batches | shopId, productId, availableGrams, batchDate, expiresAt |
| inventory_movements | shopId, productId, type, grams, referenceType, referenceId |
| carts | customerId, shopId, items[], updatedAt |
| orders | orderNumber, customerId, shopId, items[] (snapshot), totals, status, slot |
| order_events | orderId, fromStatus, toStatus, actorId, reason |
| payments | orderId, provider, providerRef (unique), amountPaise, status |
| refunds | paymentId, orderId, amountPaise, reason, status |
| commissions | vendorId, orderId, bps, amountPaise, ruleVersion |
| ledger_entries | accountId, orderId, type, amountPaise, referenceId |
| settlements | vendorId, period, grossPaise, deductionsPaise, netPaise, status |
| delivery_tasks | orderId, partnerId, pickupStatus, deliveryStatus, otpHash |
| addresses | userId, label, location (Point), text, pincode, district |
| reviews | customerId, shopId, orderId (unique), rating, comment |
| coupons | code, rules, validFrom, validUntil, usageLimits |
| support_tickets | ticketNumber, orderId, customerId, vendorId, category, status |
| notifications | userId, type, payload, readAt |
| audit_logs | actorId, action, entityType, entityId, metadata |
| counters | name, seq |

Indexes: unique phone; `products {shopId, status}`; `shops.location 2dsphere`; `orders {customerId, createdAt:-1}`; `orders {shopId, status}`; unique `payments.providerRef`; TTL on `refresh_sessions.expiresAt` and reservations.

## 7. Order lifecycle

```
PENDING_PAYMENT ──paid──► PLACED ──accept──► ACCEPTED ──► PREPARING ──► READY ──► OUT_FOR_DELIVERY ──► DELIVERED
      │                      │  └─reject──► REJECTED ──► REFUND_PENDING ──► REFUNDED
      └─failed/expired──► CANCELLED ◄──cancel (policy)──┘
DELIVERED ──issue──► DISPUTED ──► RESOLVED
```
Transitions are defined once in a state-machine config with allowed actor roles per transition.

**Example — 500 g chicken:** pick shop + variant → server checks serviceability, price, stock → checkout reserves stock with expiry → payment (or COD) → order PLACED, vendor notified → vendor accepts, prepares, records packed weight → delivery assigned, customer updates → DELIVERED posts commission + ledger entries. Failed payment or expired reservation releases stock. Webhooks and retries are idempotent.

## 8. API (prefix `/api/v1`)

| Area | Endpoints |
| ---- | --------- |
| Auth | `POST /auth/otp/request`, `/auth/otp/verify`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Discovery | `GET /shops/nearby`, `/shops/:shopId`, `/shops/:shopId/products` |
| Products | `GET /products`, `/products/:productId` |
| Cart | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId` |
| Checkout | `POST /checkout/quote`, `POST /checkout` (Idempotency-Key) |
| Orders | `GET /orders/my`, `/orders/:orderId`, `POST /orders/:orderId/cancel` |
| Vendor | `/vendor/shop`, `/vendor/products`, `/vendor/inventory`, `/vendor/orders/:orderId/accept|reject|status`, `/vendor/settlements`, `/vendor/analytics/sales` |
| Delivery | `GET /delivery/tasks/my`, `POST /delivery/tasks/:taskId/status` |
| Payments | `POST /payments/create`, `POST /payments/webhooks/:provider` |
| Admin | `/admin/vendors`, `/admin/vendors/:vendorId/approve`, `/admin/settlements`, `/admin/analytics/overview`, `/admin/config` |

Swagger: bearer auth, envelope + paginated schemas, error schema, examples; protected in production; `swagger.json` drives frontend type generation.

## 9. Frontend pages

**public/** — Home + location, nearby shops, shop detail, category/search, product detail, cart, checkout, order tracking, order history, profile, addresses, favourites, support.

**admin/ — Vendor** — overview KPIs, orders + preparation queue, products, inventory + wastage, shop settings + slots, promotions, reports, settlements, staff.

**admin/ — Admin** — overview, vendor verification, shop/product moderation, customers, delivery partners, orders/refunds/disputes, commissions, reconciliation, roles/permissions, audit logs, config.

**admin/ — Delivery** — tasks, pickup details, status updates, OTP confirmation, earnings.

## 10. Security, compliance, reliability
- Hashed passwords, refresh rotation with reuse detection, rate limits on auth/OTP.
- Vendors see only their own shop data; ownership derived from token.
- FSSAI registration/licence workflow and expiry tracking; category permission per vendor and local rules.
- Payment signature verification, idempotent webhooks, no card data stored.
- HTTPS, minimal PII, masked phones in logs, restricted admin access.
- No overselling: atomic conditional updates + reservation expiry.
- Ledger with reversal-only corrections, reconciliation reports.
- Structured logs, health checks, error monitoring, backups with tested restore.
- Unit, integration and e2e tests for checkout, cancel, refund, settlement.

## 11. Roadmap (16–24 weeks)

| Weeks | Phase | Scope |
| ----- | ----- | ----- |
| 1–2 | Foundation | Everything ⭐ in `REUSABLE_CHECKLIST.md`, local MongoDB, Swagger, app shells, design system |
| 3–5 | Auth & onboarding | OTP auth, roles, vendor registration, documents, admin approval |
| 6–8 | Catalogue & inventory | Categories, products, images, discovery, geo search, stock + movements + reservations |
| 9–12 | Checkout & orders | Cart, quote, order creation, state machine, vendor queue, notifications, cancellations |
| 13–16 | Payments & admin | Razorpay + webhooks, commission, refunds, ledger, vendor analytics, support, audit |
| 17–20+ | Delivery & launch | Delivery portal or vendor delivery, slots, load/security tests, CI/CD, monitoring, pilot shops |

Later: settlement automation, loyalty, multi-shop checkout, live tracking, demand forecasting, mobile apps, more districts.

## 12. MVP checklist
- [ ] Foundation: NestJS + MongoDB + Swagger + reusable layer (Part A ⭐) and both frontend shells (Part B ⭐)
- [ ] Auth and role permissions
- [ ] Vendor registers, admin approves
- [ ] Vendor creates shop, publishes product, sets stock
- [ ] Product appears in storefront for a nearby customer
- [ ] Add to cart with stock validation
- [ ] Place order (COD), appears in vendor dashboard
- [ ] Vendor accepts, prepares, completes
- [ ] Commission and vendor payable recorded in ledger
- [ ] Automated e2e test for the full flow

First milestone: one customer in one Tamil Nadu locality orders from one approved shop, the shop fulfils it, and the platform records payment and commission correctly.
