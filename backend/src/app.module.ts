import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { WorkbookModule } from './modules/workbook/workbook.module';
import { ReservesModule } from './modules/reserves/reserves.module';
import { ReportsModule } from './modules/reports/reports.module';
import { JournalEntryModule } from './modules/journal-entry/journal-entry.module';
import { GeneralLedgerModule } from './modules/general-ledger/general-ledger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    DatabaseModule,
    WorkbookModule,
    ReservesModule,
    ReportsModule,
    JournalEntryModule,
    GeneralLedgerModule,
  ],
})
export class AppModule {}
