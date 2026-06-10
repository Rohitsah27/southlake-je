import { Injectable } from '@nestjs/common';
import { WorkbookService } from '../../workbook/services/workbook.service';
import { ReportsService } from '../../reports/services/reports.service';
import { StateExhibit } from '../../workbook/entities/state-exhibit.entity';
import { Workbook } from '../../workbook/entities/workbook.entity';

@Injectable()
export class JournalEntryService {
  constructor(
    private readonly workbookService: WorkbookService,
    private readonly reportsService: ReportsService,
  ) {}

  async getGLJournalEntries(workbookId: number, stateCode: string) {
    const workbook = await this.workbookService.findOne(workbookId);
    const prevStateEx = await this.getPreviousStateExhibit(workbook, stateCode);
    const v = this.reportsService.calculateCedingValues(workbook, stateCode, prevStateEx);

    const GL_MAPPING_SCHEMA_TEMPLATE = [
      { desc: 'Uncollected Premium Direct', account: '120100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.premiumWritten },
      { desc: 'Direct Premium Written', account: '400100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.premiumWritten },
      { desc: 'Change in Unearned Premium Direct', account: '411100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeUEP },
      { desc: 'Unearned Premium Direct', account: '230100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeUEP },
      { desc: 'Ceded Premium Written', account: '400300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.premiumWritten },
      { desc: 'Ceded Reinsurance Premiums Payable', account: '243100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.premiumWritten },
      { desc: 'Unearned Premium Ceded', account: '230300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeUEP },
      { desc: 'Change in Unearned Premium Ceded', account: '411300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeUEP },
      { desc: 'Commissions Direct', account: '500100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.cedingCommission },
      { desc: 'Uncollected Premium Direct', account: '120100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.cedingCommission },
      { desc: 'Ceded Reinsurance Premiums Payable', account: '243100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.cedingCommission },
      { desc: 'Commissions Ceded', account: '500300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.cedingCommission },
      { desc: 'Direct Losses paid', account: '600100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.lossesPaid },
      { desc: 'Payable to MGA', account: '264400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.lossesPaid },
      { desc: 'Amounts recoverable from reinsurers', account: '125100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.lossesPaid },
      { desc: 'Ceded Losses Paid', account: '600300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.lossesPaid },
      { desc: 'Change in Case Loss Reserves - Direct', account: '550100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeLossReserves },
      { desc: 'Case Loss Reserves - Direct', account: '200100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeLossReserves },
      { desc: 'Case Loss Reserves - Ceded', account: '200300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeLossReserves },
      { desc: 'Change in Case Loss Reserves - Ceded', account: '550300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeLossReserves },
      { desc: 'Change in IBNR Loss Reserves - Direct', account: '550400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeLossIBNR },
      { desc: 'IBNR Loss Reserves - Direct', account: '200400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeLossIBNR },
      { desc: 'IBNR Loss Reserves - Ceded', account: '200600', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeLossIBNR },
      { desc: 'Change in IBNR Loss Reserves - Ceded', account: '550600', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeLossIBNR },
      { desc: 'Direct LAE DCC Paid', account: '601100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.dccPaid },
      { desc: 'Payable to MGA', account: '264400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.dccPaid },
      { desc: 'Amounts recoverable from reinsurers', account: '125100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.dccPaid },
      { desc: 'Ceded LAE DCC Paid', account: '601300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.dccPaid },
      { desc: 'Change in LAE DCC Reserves - Direct', account: '557100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeDCCReserves },
      { desc: 'LAE DCC Reserves - Direct', account: '207100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeDCCReserves },
      { desc: 'LAE DCC Reserves - Ceded', account: '207300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeDCCReserves },
      { desc: 'Change in LAE DCC Reserves - Ceded', account: '557300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeDCCReserves },
      { desc: 'Change in IBNR DCC Reserves - Direct', account: '557400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeDCCIBNR },
      { desc: 'IBNR DCC Reserves - Direct', account: '207400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeDCCIBNR },
      { desc: 'IBNR DCC Reserves - Ceded', account: '207600', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeDCCIBNR },
      { desc: 'Change in IBNR DCC Reserves - Ceded', account: '557600', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeDCCIBNR },
      { desc: 'Direct LAE A&O Paid', account: '602100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.aoePaid },
      { desc: 'Payable to MGA', account: '264400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.aoePaid },
      { desc: 'Amounts recoverable from reinsurers', account: '125100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.aoePaid },
      { desc: 'Ceded LAE A&O Paid', account: '602300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.aoePaid },
      { desc: 'Change in LAE A&O Reserves - Direct', account: '558100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeAOEReserves },
      { desc: 'LAE A&O Reserves - Direct', account: '208100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeAOEReserves },
      { desc: 'LAE A&O Reserves - Ceded', account: '208300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeAOEReserves },
      { desc: 'Change in LAE A&O Reserves - Ceded', account: '558300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeAOEReserves },
      { desc: 'Change in IBNR A&O Reserves - Direct', account: '558400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeAOEIBNR },
      { desc: 'IBNR A&O Reserves - Direct', account: '208400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeAOEIBNR },
      { desc: 'IBNR A&O Reserves - Ceded', account: '208600', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeAOEIBNR },
      { desc: 'Change in IBNR A&O Reserves - Ceded', account: '558600', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeAOEIBNR },
      { desc: 'Direct ULAE Paid', account: '603100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.ulaePaid },
      { desc: 'Payable to MGA', account: '264400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.ulaePaid },
      { desc: 'Amounts recoverable from reinsurers', account: '125100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.ulaePaid },
      { desc: 'Ceded ULAE Paid', account: '603300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.ulaePaid },
      { desc: 'Change in IBNR ULAE Reserves - Direct', account: '559400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeULAEIBNR },
      { desc: 'IBNR ULAE Reserves - Direct', account: '209400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeULAEIBNR },
      { desc: 'IBNR ULAE Reserves - Ceded', account: '209600', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.changeULAEIBNR },
      { desc: 'Change in IBNR ULAE Reserves - Ceded', account: '559600', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.changeULAEIBNR },
      { desc: 'Other amounts recoverable from reinsurers', account: '127100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.boardsCharge },
      { desc: 'Commissions Ceded', account: '500300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.boardsCharge },
      { desc: 'Commissions Ceded', account: '500300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.boardsUEP },
      { desc: 'Deferred Ceding Commissions', account: '243200', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.boardsUEP },
      { desc: 'Ceded Reinsurance Premiums Payable', account: '243100', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.lossRatioCap },
      { desc: 'Commissions Ceded', account: '500300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.lossRatioCap },
      { desc: 'Commissions Ceded', account: '500300', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.lossRatioCapUEP },
      { desc: 'Deferred Ceding Commissions', account: '243200', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.lossRatioCapUEP },
      { desc: 'Receivable from MGA', account: '160400', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.frontingFee },
      { desc: 'Fronting Fees', account: '500110', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.frontingFee },
      { desc: 'Fronting Fees', account: '500110', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: 'state', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => -vals.frontingFeeUEP },
      { desc: 'Deferred Ceding Commissions', account: '243200', cc: workbook.cc, mga: workbook.mga, lob: workbook.lob, st: '00', ext: workbook.ext, sub: workbook.sub, lineDesc: workbook.lineDescSuffix, formula: (vals: any) => vals.frontingFeeUEP }
    ];

    const rows: any[] = [];
    GL_MAPPING_SCHEMA_TEMPLATE.forEach(schema => {
      let val = schema.formula(v);
      val = Math.round(val * 100) / 100;
      if (val === 0) return;

      const st = schema.st === 'state' ? stateCode : schema.st;

      rows.push({
        desc: schema.desc,
        comp: workbook.comp,
        account: schema.account,
        cc: schema.cc,
        mga: schema.mga,
        lob: schema.lob,
        st,
        ext: schema.ext,
        sub: schema.sub,
        lineDesc: schema.lineDesc,
        debit: val > 0 ? val : 0,
        credit: val < 0 ? Math.abs(val) : 0,
      });
    });
    return rows;
  }

  private async getPreviousStateExhibit(workbook: Workbook, stateCode: string): Promise<StateExhibit | null> {
    const prevWb = await this.workbookService.findPreviousWorkbookFor(workbook);
    if (!prevWb || !prevWb.stateExhibits) return null;
    const ex = prevWb.stateExhibits.find(e => e.stateCode === stateCode) || null;
    if (ex) {
      ex.workbook = prevWb;
    }
    return ex;
  }

  private getPreviousMonthKey(monthKey: string): string {
    const parts = monthKey.split('-');
    let year = parseInt(parts[0]);
    let month = parseInt(parts[1]);
    month--;
    if (month === 0) {
      month = 12;
      year--;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  }
}
