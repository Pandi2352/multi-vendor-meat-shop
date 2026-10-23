import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commission, CommissionSchema } from './schemas/commission.schema.js';
import { LedgerEntry, LedgerEntrySchema } from './schemas/ledger-entry.schema.js';
import { Settlement, SettlementSchema } from './schemas/settlement.schema.js';
import { CommissionRepository } from './repositories/commission.repository.js';
import { LedgerEntryRepository } from './repositories/ledger-entry.repository.js';
import { SettlementRepository } from './repositories/settlement.repository.js';
import { FinanceService } from './services/finance.service.js';
import { VendorFinanceController } from './controllers/vendor-finance.controller.js';
import { AdminFinanceController } from './controllers/admin-finance.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
      { name: LedgerEntry.name, schema: LedgerEntrySchema },
      { name: Settlement.name, schema: SettlementSchema },
    ]),
  ],
  controllers: [VendorFinanceController, AdminFinanceController],
  providers: [
    CommissionRepository,
    LedgerEntryRepository,
    SettlementRepository,
    FinanceService,
  ],
  exports: [FinanceService, CommissionRepository, LedgerEntryRepository, SettlementRepository],
})
export class FinanceModule {}
