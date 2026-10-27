---
name: react-feature
description: Use when building a page, feature, form, table or API hook in public/ or admin/. Enforces the feature folder template, TanStack Query key factories, shared mutation hook, RHF + Zod forms from shared fields, URL-synced filters, generated API types and i18n.
---

# React feature

## Folder template
```
src/features/<feature>/
  api/
    keys.ts                       # query key factory
    <feature>.api.ts              # request functions (http.ts)
    use-<feature>-queries.ts      # useXList, useXDetail
    use-<feature>-mutations.ts    # useCreateX, useUpdateX
  components/                     # feature-only pieces, ≤150 lines each
  hooks/                          # feature logic (filters, derived state)
  pages/                          # thin route pages
  schemas/                        # zod form schemas
  constants/
  index.ts
```

## API layer
```ts
// api/keys.ts
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

// api/products.api.ts
export const productsApi = {
  list: (params: ProductListParams) => http.getPaginated<Product>(API.VENDOR_PRODUCTS, params),
  detail: (id: string) => http.get<Product>(buildPath(API.VENDOR_PRODUCT, { id })),
  update: (id: string, body: UpdateProductBody) => http.patch<Product>(buildPath(API.VENDOR_PRODUCT, { id }), body),
};

// api/use-products-mutations.ts
export const useUpdateProduct = () =>
  useAppMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductBody }) => productsApi.update(id, body),
    successMessage: 'products.updated',
    invalidate: [productKeys.lists()],
  });
```
- Types (`Product`, `UpdateProductBody`) come from `types/api.generated.ts` aliases — never hand-written duplicates.
- Endpoint paths from `config/api-endpoints.ts`; route paths from `config/routes.ts`.
- **Common API Client (`lib/api-client`, `lib/http`)**:
  - Request interceptor automatically attaches `Authorization: Bearer <accessToken>` from `tokenStorage`.
  - Response interceptor unwraps `{ success: true, data, meta? }` envelopes (`http.get`, `post`, `patch`, `delete` return `data`; `http.getPaginated` returns `{ items, meta }`).
  - Error normalization: Any API failure is normalized into a strongly-typed `ApiError(status, { code, message, details, requestId, path, timestamp })`.
  - Single-place status code handling:
    - `401`: Enqueues pending requests, runs a single `/auth/refresh` request, updates access token, and retries queued calls. If refresh fails, purges tokens.
    - `403`, `404`, `500`: Captured cleanly and rendered via `components/layout` (`RouteErrorPage`, `NotFoundPage`, `ForbiddenPage`, `ServerErrorPage`, `ErrorBoundary`).
    - `400` / `422`: Form errors extracted cleanly with `getFieldErrors(err)`.

## Page pattern (thin)
```tsx
export function ProductsPage() {
  const { t } = useTranslation('products');
  const { params, setParams } = useUrlState(productListDefaults);
  const query = useProductList(params);

  return (
    <PageContainer>
      <PageHeader title={t('title')} actions={<Button leftIcon={<Icon name="plus" />}>{t('add')}</Button>} />
      <FilterBar config={productFilters} value={params} onChange={setParams} />
      <DataTable columns={productColumns} query={query} onPageChange={(page) => setParams({ page })} />
    </PageContainer>
  );
}
```
- Columns, filters and nav are config objects in `constants/`, not inline JSX blobs.
- Loading/empty/error handled by `DataTable` / `QueryState` — no ad-hoc spinners.

## Forms
```tsx
const schema = z.object({ name: zRequiredString(2, 80), pricePerKgPaise: zPaise(), categoryId: zUuid() });

export function ProductForm({ defaultValues, onSubmit }: ProductFormProps) {
  const form = useZodForm(schema, { defaultValues });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormInput name="name" label="products.name" />
      <FormPrice name="pricePerKgPaise" label="products.pricePerKg" />
      <FormCombobox name="categoryId" label="products.category" options={categoryOptions} />
      <FormActions />
    </Form>
  );
}
```
- Schemas in `schemas/`, built from `utils/validation` primitives.
- `FormPrice` shows ₹ and stores paise; `FormWeight` shows kg/g and stores grams.
- Server validation errors map to fields via `Form` (uses `applyServerErrors`).

## Adding an admin page (sidebar, breadcrumb, search)
1. Add the path to `admin/src/config/routes.ts`.
2. Add one entry to `NAV_SECTIONS` in `admin/src/config/nav.config.ts` (`type: 'link'`, or a child of a `type: 'group'`). The sidebar, collapsed flyouts, navbar breadcrumb and Ctrl+K search all read from it. Mark unbuilt pages `soon: true` — they get a "coming soon" route automatically.
3. Add who may open it to `ROUTE_ACCESS` in `admin/src/config/route-access.ts` (mirror the server `@Auth` roles of the API it calls). The sidebar, search, breadcrumb, quick actions and the route guard all follow it. Unlisted pages are open to every portal user.
4. Register the page element in `admin/src/app/router.tsx` (inside the `AdminLayout` children) and remove `soon`.
5. Pages render inside `AdminLayout` (`components/layout/AdminLayout.tsx`) — never add another header, sidebar or page-width container. Callback-style pages get an adapter in `app/route-elements.tsx`.

## Rules
- Filters, pagination and sort live in the URL (`useUrlState`) so pages are shareable and back-button safe.
- Display through `utils/format` and `components/domain` (`PriceText`, `WeightText`, `OrderStatusBadge`).
- Role/permission checks with `PermissionGate` / `usePermission`, never `user.role === 'ADMIN'` inline.
- All user-facing text through `t('ns.key')` with entries in `en` and `ta`.
- Global state only for auth, cart, location, UI prefs. Everything from the server stays in TanStack Query.
- Lazy-load pages through `lazyPage()` in the route config.

## Done checklist
- [ ] Page ≤150 lines, logic in hooks
- [ ] Loading, empty, error states visible
- [ ] Mobile layout checked (storefront mobile-first)
- [ ] i18n keys added (en + ta)
- [ ] MSW handler + test for the main flow
- [ ] `bash scripts/check-rules.sh` passes
