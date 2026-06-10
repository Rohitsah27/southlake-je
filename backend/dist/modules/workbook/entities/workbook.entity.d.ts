import { StateExhibit } from './state-exhibit.entity';
import { CashSettlement } from './cash-settlement.entity';
export declare class Workbook {
    id: number;
    program: string;
    monthKey: string;
    monthLabel: string;
    source: string;
    rates: {
        qs?: number;
        cf?: number;
        comm?: number;
        bb?: number;
        ulae?: number;
        xol?: number;
        lr?: number;
        lossPick?: number;
        laeDcc?: number;
        laeAoe?: number;
        boardsCharge?: number;
        lossRatioCap?: number;
    };
    mga: string;
    lob: string;
    lineDescSuffix: string;
    comp: string;
    cc: string;
    ext: string;
    sub: string;
    createdAt: Date;
    stateExhibits: StateExhibit[];
    cashSettlement: CashSettlement;
}
