export const ROUTES = {
  HOME: '/',
  SHOPS: '/shops',
  SHOP_DETAIL: '/shops/:shopId',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:orderId',
  PROFILE: '/profile',
} as const;

export const buildPath = (path: string, params: Record<string, string>): string => {
  let result = path;
  for (const [key, val] of Object.entries(params)) {
    result = result.replace(`:${key}`, encodeURIComponent(val));
  }
  return result;
};
