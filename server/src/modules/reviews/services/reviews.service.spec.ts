import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorCode } from '#common/exceptions';
import { OrderStatus } from '#common/enums';
import { ReviewsService } from './reviews.service.js';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepo: any;
  let orderRepo: any;
  let shopRepo: any;
  let userRepo: any;

  beforeEach(() => {
    reviewRepo = {
      findByOrderId: vi.fn(),
      create: vi.fn(),
      calculateShopRating: vi.fn(),
      paginate: vi.fn(),
    };
    orderRepo = {
      findById: vi.fn(),
    };
    shopRepo = {
      updateById: vi.fn(),
    };
    userRepo = {
      findById: vi.fn(),
    };

    service = new ReviewsService(reviewRepo, orderRepo, shopRepo, userRepo);
  });

  it('rejects review creation if order does not exist', async () => {
    orderRepo.findById.mockResolvedValue(null);

    await expect(
      service.createReview('cust-1', 'ord-1', { rating: 5 }),
    ).rejects.toThrow('Order');
  });

  it('rejects review if customer is not the order owner', async () => {
    orderRepo.findById.mockResolvedValue({
      _id: 'ord-1',
      customerId: 'other-cust',
      status: OrderStatus.DELIVERED,
    });

    await expect(
      service.createReview('cust-1', 'ord-1', { rating: 5 }),
    ).rejects.toThrow('You can only review your own orders');
  });

  it('rejects review if order is not delivered', async () => {
    orderRepo.findById.mockResolvedValue({
      _id: 'ord-1',
      customerId: 'cust-1',
      status: OrderStatus.PLACED,
    });

    await expect(
      service.createReview('cust-1', 'ord-1', { rating: 5 }),
    ).rejects.toMatchObject({ code: ErrorCode.REVIEW_ORDER_NOT_DELIVERED });
  });

  it('rejects review if a review already exists for the order', async () => {
    orderRepo.findById.mockResolvedValue({
      _id: 'ord-1',
      customerId: 'cust-1',
      status: OrderStatus.DELIVERED,
    });
    reviewRepo.findByOrderId.mockResolvedValue({ _id: 'rev-1' });

    await expect(
      service.createReview('cust-1', 'ord-1', { rating: 5 }),
    ).rejects.toMatchObject({ code: ErrorCode.REVIEW_ALREADY_EXISTS });
  });

  it('creates review and updates shop rating average and count', async () => {
    orderRepo.findById.mockResolvedValue({
      _id: 'ord-1',
      shopId: 'shop-1',
      customerId: 'cust-1',
      status: OrderStatus.DELIVERED,
    });
    reviewRepo.findByOrderId.mockResolvedValue(null);
    userRepo.findById.mockResolvedValue({ name: 'Selvam Murugan' });
    reviewRepo.create.mockResolvedValue({
      _id: 'rev-1',
      shopId: 'shop-1',
      orderId: 'ord-1',
      customerId: 'cust-1',
      customerName: 'Selvam Murugan',
      rating: 5,
      comment: 'Super fresh goat cuts!',
      isVerifiedPurchase: true,
      createdAt: new Date(),
    });
    reviewRepo.calculateShopRating.mockResolvedValue({
      averageRating: 4.8,
      totalReviews: 12,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 10 },
    });

    const res = await service.createReview('cust-1', 'ord-1', {
      rating: 5,
      comment: 'Super fresh goat cuts!',
    });

    expect(res.rating).toBe(5);
    expect(res.customerName).toBe('Selvam Murugan');
    expect(shopRepo.updateById).toHaveBeenCalledWith('shop-1', {
      ratingAverage: 4.8,
      ratingCount: 12,
    });
  });

  it('returns shop rating summary and distribution', async () => {
    reviewRepo.calculateShopRating.mockResolvedValue({
      averageRating: 4.7,
      totalReviews: 20,
      distribution: { 1: 1, 2: 0, 3: 1, 4: 4, 5: 14 },
    });

    const summary = await service.getShopRatingSummary('shop-1');
    expect(summary.averageRating).toBe(4.7);
    expect(summary.totalReviews).toBe(20);
    expect(summary.distribution[5]).toBe(14);
  });
});
