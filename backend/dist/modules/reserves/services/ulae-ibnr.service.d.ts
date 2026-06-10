export declare class UlaeIbnrService {
    calculateULAEReserves(pw: number, rateUlae: number, changeLossIBNR: number, prevULAEIBNR: number): {
        ulaePaid: number;
        changeULAEIBNR: number;
        currULAEIBNR: number;
        ulaeIncurred: number;
    };
}
