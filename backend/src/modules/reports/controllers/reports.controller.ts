import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';

@Controller('api/workbooks')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id/reinsurance-statement/:stateCode')
  async getReinsuranceStatement(
    @Param('id', ParseIntPipe) id: number,
    @Param('stateCode') stateCode: string,
  ) {
    return this.reportsService.getReinsuranceStatement(id, stateCode.toUpperCase());
  }

  @Get(':id/cash-settlement-calculations')
  async getCashSettlementCalculations(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.getCashSettlementCalculations(id);
  }
}
