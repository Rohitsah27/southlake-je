import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { WorkbookModule } from '../workbook/workbook.module';
import { ReservesModule } from '../reserves/reserves.module';

@Module({
  imports: [WorkbookModule, ReservesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
