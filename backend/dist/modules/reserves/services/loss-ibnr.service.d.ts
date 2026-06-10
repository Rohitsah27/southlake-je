export declare class LossIbnrService {
    calculateLossReserves(premiumsEarned: number, prevLossIBNR: number, lossPick: number): {
        changeLossReserves: number;
        changeLossIBNR: number;
        lossesIncurred: number;
        currLossIBNR: number;
    };
}
