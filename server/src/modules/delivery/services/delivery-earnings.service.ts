import { Injectable } from '@nestjs/common';
import { DeliveryTaskRepository } from '../repositories/delivery-task.repository.js';
import { toDeliveryTaskResponseDto } from '../mappers/delivery-task.mapper.js';
import type { DeliveryEarningsResponseDto } from '../dto/delivery-earnings-response.dto.js';

const TRIP_PAY_PAISE = 4000; // ₹40 trip pay per delivered order

@Injectable()
export class DeliveryEarningsService {
  constructor(private readonly taskRepo: DeliveryTaskRepository) {}

  async getPartnerEarnings(partnerId: string): Promise<DeliveryEarningsResponseDto> {
    const tasks = await this.taskRepo.findPartnerDeliveredTasks(partnerId);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let cashInHandPaise = 0;
    let todayTripsCount = 0;
    let todayCashInHandPaise = 0;

    for (const t of tasks) {
      if (t.codCollected && t.codAmountPaise > 0) {
        cashInHandPaise += t.codAmountPaise;
      }
      const taskDate = t.deliveredAt ? new Date(t.deliveredAt) : new Date(t.createdAt);
      if (taskDate >= startOfToday) {
        todayTripsCount++;
        if (t.codCollected && t.codAmountPaise > 0) {
          todayCashInHandPaise += t.codAmountPaise;
        }
      }
    }

    const completedTripsCount = tasks.length;
    const totalEarningsPaise = completedTripsCount * TRIP_PAY_PAISE;
    const todayEarningsPaise = todayTripsCount * TRIP_PAY_PAISE;
    const recentTrips = tasks.slice(0, 10).map((t) => toDeliveryTaskResponseDto(t, false));

    return {
      completedTripsCount,
      totalEarningsPaise,
      cashInHandPaise,
      todayTripsCount,
      todayEarningsPaise,
      todayCashInHandPaise,
      recentTrips,
    };
  }
}
