export declare class LaeIbnrService {
    calculateLAEReserves(premiumsEarned: number, prevDCCIBNR: number, laeDcc: number, laeAoe: number): {
        changeDCCReserves: number;
        changeDCCIBNR: number;
        currDCCIBNR: number;
        dccIncurred: number;
        changeAOEReserves: number;
        changeAOEIBNR: number;
        currAOEIBNR: number;
        aoeIncurred: number;
    };
}
