import { Injectable } from '@nestjs/common';
import { formatIST, nowIST } from '#common/utils';
import { CounterRepository } from '../repositories/counter.repository.js';

@Injectable()
export class OrderNumberService {
  constructor(private readonly counterRepo: CounterRepository) {}

  async generateNextOrderNumber(): Promise<string> {
    const dateStr = formatIST(nowIST(), 'YYYYMMDD');
    const counterKey = `order_${dateStr}`;
    const seq = await this.counterRepo.getNextSequence(counterKey);
    const padded = String(seq).padStart(4, '0');
    return `TN-${dateStr}-${padded}`;
  }
}
