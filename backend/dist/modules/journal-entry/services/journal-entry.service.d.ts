import { WorkbookService } from '../../workbook/services/workbook.service';
import { ReportsService } from '../../reports/services/reports.service';
export declare class JournalEntryService {
    private readonly workbookService;
    private readonly reportsService;
    constructor(workbookService: WorkbookService, reportsService: ReportsService);
    getGLJournalEntries(workbookId: number, stateCode: string): Promise<any[]>;
    private getPreviousStateExhibit;
    private getPreviousMonthKey;
}
