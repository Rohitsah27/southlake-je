import { Module } from '@nestjs/common';
import { GeneralLedgerService } from './services/general-ledger.service';

@Module({
  providers: [GeneralLedgerService],
  exports: [GeneralLedgerService],
})
export class GeneralLedgerModule {}
