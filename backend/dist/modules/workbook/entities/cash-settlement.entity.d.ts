import { Workbook } from './workbook.entity';
export declare class CashSettlement {
    id: number;
    workbookId: number;
    begBal: number;
    amtPaid: number;
    workbook: Workbook;
}
