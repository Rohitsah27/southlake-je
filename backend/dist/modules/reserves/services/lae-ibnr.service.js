"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaeIbnrService = void 0;
const common_1 = require("@nestjs/common");
let LaeIbnrService = class LaeIbnrService {
    calculateLAEReserves(premiumsEarned, prevDCCIBNR, laeDcc, laeAoe) {
        let actualPrevDCCIBNR = 0.0;
        let actualPrevAOEIBNR = 0.0;
        if (laeDcc > 0) {
            actualPrevDCCIBNR = prevDCCIBNR;
        }
        else if (laeAoe > 0) {
            actualPrevAOEIBNR = prevDCCIBNR;
        }
        const changeDCCReserves = 0.0;
        const changeDCCIBNR = premiumsEarned * (laeDcc / 100);
        const currDCCIBNR = actualPrevDCCIBNR + changeDCCIBNR;
        const dccIncurred = changeDCCReserves + changeDCCIBNR;
        const changeAOEReserves = 0.0;
        const changeAOEIBNR = premiumsEarned * (laeAoe / 100);
        const currAOEIBNR = actualPrevAOEIBNR + changeAOEIBNR;
        const aoeIncurred = changeAOEReserves + changeAOEIBNR;
        return {
            changeDCCReserves,
            changeDCCIBNR,
            currDCCIBNR,
            dccIncurred,
            changeAOEReserves,
            changeAOEIBNR,
            currAOEIBNR,
            aoeIncurred,
        };
    }
};
exports.LaeIbnrService = LaeIbnrService;
exports.LaeIbnrService = LaeIbnrService = __decorate([
    (0, common_1.Injectable)()
], LaeIbnrService);
//# sourceMappingURL=lae-ibnr.service.js.map