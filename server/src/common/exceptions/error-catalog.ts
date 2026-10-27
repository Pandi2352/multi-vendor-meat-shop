import { HttpStatus } from '@nestjs/common';
import { ErrorCode as E } from './error-code.enum.js';

interface ErrorDefinition {
  status: HttpStatus;
  message: string;
}

/** Default HTTP status and message for every error code. */
export const ERROR_CATALOG: Readonly<Record<E, ErrorDefinition>> = {
  [E.INTERNAL_ERROR]: { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Something went wrong' },
  [E.BAD_REQUEST]: { status: HttpStatus.BAD_REQUEST, message: 'Bad request' },
  [E.VALIDATION_FAILED]: { status: HttpStatus.BAD_REQUEST, message: 'Validation failed' },
  [E.UNAUTHORIZED]: { status: HttpStatus.UNAUTHORIZED, message: 'Authentication required' },
  [E.FORBIDDEN]: {
    status: HttpStatus.FORBIDDEN,
    message: 'You do not have access to this resource',
  },
  [E.NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'Resource not found' },
  [E.ROUTE_NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'Route not found' },
  [E.CONFLICT]: { status: HttpStatus.CONFLICT, message: 'Request conflicts with current state' },
  [E.DUPLICATE_VALUE]: {
    status: HttpStatus.CONFLICT,
    message: 'A record with this value already exists',
  },
  [E.PAYLOAD_TOO_LARGE]: {
    status: HttpStatus.PAYLOAD_TOO_LARGE,
    message: 'Request body is too large',
  },
  [E.TOO_MANY_REQUESTS]: {
    status: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Too many requests, try again later',
  },
  [E.REQUEST_TIMEOUT]: { status: HttpStatus.REQUEST_TIMEOUT, message: 'Request timed out' },
  [E.SERVICE_UNAVAILABLE]: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Service unavailable',
  },
  [E.BUSINESS_RULE_VIOLATION]: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'Request breaks a business rule',
  },
  [E.INVALID_STATUS_TRANSITION]: {
    status: HttpStatus.CONFLICT,
    message: 'Status change is not allowed',
  },
  [E.TRANSACTION_NOT_SUPPORTED]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'MongoDB must run as a replica set to use transactions',
  },

  [E.AUTH_INVALID_CREDENTIALS]: { status: HttpStatus.UNAUTHORIZED, message: 'Invalid credentials' },
  [E.AUTH_TOKEN_EXPIRED]: { status: HttpStatus.UNAUTHORIZED, message: 'Session expired' },
  [E.AUTH_TOKEN_INVALID]: { status: HttpStatus.UNAUTHORIZED, message: 'Invalid token' },
  [E.AUTH_SESSION_REVOKED]: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Session has been revoked',
  },
  [E.OTP_INVALID]: { status: HttpStatus.BAD_REQUEST, message: 'Incorrect OTP' },
  [E.OTP_EXPIRED]: { status: HttpStatus.BAD_REQUEST, message: 'OTP has expired' },
  [E.OTP_TOO_MANY_ATTEMPTS]: {
    status: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Too many OTP attempts',
  },
  [E.ACCOUNT_SUSPENDED]: { status: HttpStatus.FORBIDDEN, message: 'Account is suspended' },
  [E.ACCOUNT_PENDING]: {
    status: HttpStatus.FORBIDDEN,
    message: 'Your account is not active yet. Open the invitation link we emailed you to set your password.',
  },
  [E.RESET_LINK_INVALID]: {
    status: HttpStatus.BAD_REQUEST,
    message: 'This password reset link is invalid or has expired. Request a new one.',
  },

  [E.VENDOR_NOT_APPROVED]: { status: HttpStatus.FORBIDDEN, message: 'Vendor is not approved yet' },
  [E.SHOP_CLOSED]: { status: HttpStatus.UNPROCESSABLE_ENTITY, message: 'Shop is closed right now' },
  [E.SHOP_NOT_SERVICEABLE]: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'Shop does not deliver to this address',
  },
  [E.PRODUCT_UNAVAILABLE]: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'Product is unavailable',
  },
  [E.OUT_OF_STOCK]: { status: HttpStatus.CONFLICT, message: 'Not enough stock' },
  [E.PRICE_CHANGED]: {
    status: HttpStatus.CONFLICT,
    message: 'Price has changed, review your cart',
  },
  [E.CART_SHOP_MISMATCH]: {
    status: HttpStatus.CONFLICT,
    message: 'Cart can hold items from one shop only',
  },
  [E.MIN_ORDER_NOT_MET]: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'Minimum order value not met',
  },
  [E.SLOT_FULL]: { status: HttpStatus.CONFLICT, message: 'Selected delivery slot is full' },
  [E.COUPON_INVALID]: { status: HttpStatus.UNPROCESSABLE_ENTITY, message: 'Coupon is not valid' },

  [E.ORDER_NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'Order not found' },
  [E.ORDER_NOT_CANCELLABLE]: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'Order cannot be cancelled in its current state',
  },
  [E.ORDER_INVALID_STATE]: {
    status: HttpStatus.CONFLICT,
    message: 'Order is in an invalid state for this action',
  },

  [E.PAYMENT_FAILED]: { status: HttpStatus.PAYMENT_REQUIRED, message: 'Payment failed' },
  [E.PAYMENT_SIGNATURE_INVALID]: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Invalid payment signature',
  },
  [E.IDEMPOTENCY_CONFLICT]: {
    status: HttpStatus.CONFLICT,
    message: 'Idempotency key was already used with a different request',
  },

  [E.DELIVERY_TASK_NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: 'Delivery task not found' },
  [E.DELIVERY_OTP_INVALID]: { status: HttpStatus.BAD_REQUEST, message: 'Invalid delivery OTP' },
  [E.DELIVERY_ALREADY_ASSIGNED]: {
    status: HttpStatus.CONFLICT,
    message: 'Delivery task is already assigned to a partner',
  },
  [E.DELIVERY_INVALID_STATE]: {
    status: HttpStatus.CONFLICT,
    message: 'Delivery task is in an invalid state for this operation',
  },
};
