import { ApiProperty } from '@nestjs/swagger';
import { DeliveryTaskResponseDto } from './delivery-task-response.dto.js';

export class DeliveryEarningsResponseDto {
  @ApiProperty({ example: 25 })
  completedTripsCount!: number;

  @ApiProperty({ example: 100000, description: 'Net earnings in paise (₹40 per delivery)' })
  totalEarningsPaise!: number;

  @ApiProperty({ example: 1250000, description: 'Cash collected in paise to deposit at hub' })
  cashInHandPaise!: number;

  @ApiProperty({ example: 5 })
  todayTripsCount!: number;

  @ApiProperty({ example: 20000 })
  todayEarningsPaise!: number;

  @ApiProperty({ example: 215000 })
  todayCashInHandPaise!: number;

  @ApiProperty({ type: [DeliveryTaskResponseDto] })
  recentTrips!: DeliveryTaskResponseDto[];
}
