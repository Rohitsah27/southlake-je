import { Workbook } from './workbook.entity';
export declare class StateExhibit {
    id: number;
    workbookId: number;
    stateCode: string;
    pw: number[];
    pfw: number[];
    pc: number[];
    pfc: number[];
    tax: number[];
    lp: number[];
    laep: number[];
    ae_paid: number[];
    pe: number[];
    pfe: number[];
    uep: number[];
    lu: number[];
    laeu: number[];
    aeu: number[];
    loss_reserves: number[];
    lae_reserves_dcc: number[];
    lae_reserves_aoe: number[];
    loss_ibnr: number[];
    lae_ibnr_dcc: number[];
    lae_ibnr_aoe: number[];
    ulae_ibnr: number[];
    workbook: Workbook;
}
