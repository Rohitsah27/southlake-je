import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkbookController } from './controllers/workbook.controller';
import { WorkbookService } from './services/workbook.service';
import { Workbook } from './entities/workbook.entity';
import { StateExhibit } from './entities/state-exhibit.entity';
import { CashSettlement } from './entities/cash-settlement.entity';
import { Program } from './entities/program.entity';
import { ExcelParserService } from './services/excel-parser.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workbook, StateExhibit, CashSettlement, Program])],
  controllers: [WorkbookController],
  providers: [WorkbookService, ExcelParserService],
  exports: [WorkbookService, ExcelParserService, TypeOrmModule],
})
export class WorkbookModule {}
