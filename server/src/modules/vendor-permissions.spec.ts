import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { METADATA_KEY } from '#common/constants';
import { Permission as P, ROLE_PERMISSIONS, Role } from '#common/enums';
import { VendorFinanceController } from './finance/controllers/vendor-finance.controller.js';
import { VendorInventoryController } from './inventory/controllers/vendor-inventory.controller.js';
import { VendorOrdersController } from './orders/controllers/vendor-orders.controller.js';
import { VendorProductsController } from './products/controllers/vendor-products.controller.js';
import { VendorShopsController } from './shops/controllers/vendor-shops.controller.js';
import { VendorStaffController } from './users/controllers/vendor-staff.controller.js';

type AnyController = abstract new (...args: never[]) => object;

/** Permission a handler requires: its own `@Permissions()`, else the controller's. */
const required = (controller: AnyController, method: string): P[] => {
  const handler = (controller.prototype as Record<string, unknown>)[method] as object;
  return (
    (Reflect.getMetadata(METADATA_KEY.PERMISSIONS, handler) as P[] | undefined) ??
    (Reflect.getMetadata(METADATA_KEY.PERMISSIONS, controller) as P[] | undefined) ??
    []
  );
};

// Every vendor endpoint and the permission it needs. A new endpoint must be added here.
const ROUTES: [string, AnyController, string, P[]][] = [
  ['list orders', VendorOrdersController, 'list', [P.ORDER_READ]],
  ['open an order', VendorOrdersController, 'getOne', [P.ORDER_READ]],
  ['move an order along', VendorOrdersController, 'updateStatus', [P.ORDER_FULFIL]],
  ['see stock', VendorInventoryController, 'listTodayStock', []],
  ['record opening stock', VendorInventoryController, 'setOpeningStock', [P.INVENTORY_MANAGE]],
  ['adjust stock', VendorInventoryController, 'adjustStock', [P.INVENTORY_MANAGE]],
  ['see the catalogue', VendorProductsController, 'list', []],
  ['add a product', VendorProductsController, 'create', [P.PRODUCT_MANAGE]],
  ['change a product or its price', VendorProductsController, 'update', [P.PRODUCT_MANAGE]],
  ['archive a product', VendorProductsController, 'archive', [P.PRODUCT_MANAGE]],
  ['see the shop', VendorShopsController, 'getMyShop', []],
  ['change shop settings', VendorShopsController, 'updateMyShop', [P.SHOP_MANAGE]],
  ['see the staff list', VendorStaffController, 'list', [P.STAFF_MANAGE]],
  ['invite staff', VendorStaffController, 'add', [P.STAFF_MANAGE]],
  ['edit staff', VendorStaffController, 'update', [P.STAFF_MANAGE]],
  ['remove staff', VendorStaffController, 'remove', [P.STAFF_MANAGE]],
  ['see the balance', VendorFinanceController, 'getSummary', [P.SETTLEMENT_READ]],
  ['see the ledger', VendorFinanceController, 'getLedger', [P.SETTLEMENT_READ]],
  ['see settlements', VendorFinanceController, 'getSettlements', [P.SETTLEMENT_READ]],
  ['request a payout', VendorFinanceController, 'requestSettlement', [P.PAYOUT_REQUEST]],
];

const can = (role: Role, permissions: P[]) => permissions.every((p) => ROLE_PERMISSIONS[role].includes(p));

describe('vendor endpoint permissions', () => {
  it.each(ROUTES)('%s requires the right permission', (_label, controller, method, expected) => {
    expect(required(controller, method)).toEqual(expected);
  });

  it.each(ROUTES)('shop owners can %s', (_label, _controller, _method, permissions) => {
    expect(can(Role.VENDOR_OWNER, permissions)).toBe(true);
  });

  const STAFF_ALLOWED = new Set(['list orders', 'open an order', 'move an order along', 'see stock', 'record opening stock', 'adjust stock', 'see the catalogue', 'see the shop']);
  it.each(ROUTES)('staff access to "%s" is as intended', (label, _controller, _method, permissions) => {
    expect(can(Role.VENDOR_STAFF, permissions)).toBe(STAFF_ALLOWED.has(label));
  });
});
