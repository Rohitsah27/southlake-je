import { Module } from '@nestjs/common';
import { JournalEntryController } from './controllers/journal-entry.controller';
import { JournalEntryService } from './services/journal-entry.service';
import { WorkbookModule } from '../workbook/workbook.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [WorkbookModule, ReportsModule],
  controllers: [JournalEntryController],
  providers: [JournalEntryService],
  exports: [JournalEntryService],
})
export class JournalEntryModule {}
