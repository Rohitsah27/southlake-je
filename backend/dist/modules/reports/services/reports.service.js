"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const workbook_service_1 = require("../../workbook/services/workbook.service");
const loss_ibnr_service_1 = require("../../reserves/services/loss-ibnr.service");
const lae_ibnr_service_1 = require("../../reserves/services/lae-ibnr.service");
const ulae_ibnr_service_1 = require("../../reserves/services/ulae-ibnr.service");
let ReportsService = class ReportsService {
    workbookService;
    lossIbnrService;
    laeIbnrService;
    ulaeIbnrService;
    constructor(workbookService, lossIbnrService, laeIbnrService, ulaeIbnrService) {
        this.workbookService = workbookService;
        this.lossIbnrService = lossIbnrService;
        this.laeIbnrService = laeIbnrService;
        this.ulaeIbnrService = ulaeIbnrService;
    }
    async getReinsuranceStatement(workbookId, stateCode) {
        const workbook = await this.workbookService.findOne(workbookId);
        const prevStateEx = await this.getPreviousStateExhibit(workbook, stateCode);
        const v = this.calculateCedingValues(workbook, stateCode, prevStateEx);
        const rateComm = workbook.rates.comm ?? 32.0;
        const rateUlae = workbook.rates.ulae ?? 1.0;
        const rateBoards = workbook.rates.boardsCharge ?? 0.40;
        const rateLossCap = workbook.rates.lossRatioCap ?? 2.0;
        return [
            { label: 'Premiums Written', value: v.premiumWritten, isBold: true },
            { label: 'Change in UEP', value: v.changeUEP },
            { label: 'Premiums Earned', value: v.premiumsEarned, isBold: true, borderClass: 'single-underline' },
            { label: 'Less:', isHeader: true },
            { label: `Ceding Commissions at ${rateComm}%`, value: v.cedingCommission },
            { label: 'Ceding Commissions on UEP', value: v.commissionUEP },
            { label: 'Ceding Commissions Earned', value: v.commissionEarned, isBold: true, borderClass: 'single-underline' },
            { label: 'Losses Paid (net of salvage & subro)', value: v.lossesPaid },
            { label: 'Change in Loss Reserves', value: v.changeLossReserves },
            { label: 'Change in Loss IBNR Reserves', value: v.changeLossIBNR },
            { label: 'Losses Incurred', value: v.lossesIncurred, isBold: true, borderClass: 'single-underline' },
            { label: 'Defense and Cost Containment Expense Paid (DCC)', value: v.dccPaid },
            { label: 'Change in DCC Reserves', value: v.changeDCCReserves },
            { label: 'Change in DCC IBNR Reserves', value: v.changeDCCIBNR },
            { label: 'Adjusting & Other Expense Paid (AOE)', value: v.aoePaid },
            { label: 'Change in AOE Reserves', value: v.changeAOEReserves },
            { label: 'Change in AOE IBNR Reserves', value: v.changeAOEIBNR },
            { label: `Unallocated Loss Adjustment Expense at ${rateUlae}%`, value: v.ulaePaid, isBold: true },
            { label: 'Change in ULAE IBNR Reserves', value: v.changeULAEIBNR },
            { label: 'Loss Adjustment Expenses Incurred', value: v.laeIncurred, isBold: true, borderClass: 'single-underline' },
            { label: `Boards & Bureaus / ISO Charge at ${rateBoards}%`, value: v.boardsCharge },
            { label: `Boards & Bureaus / ISO Charge at ${rateBoards}% on UEP`, value: v.boardsUEP },
            { label: `Loss Ratio Cap Charge at ${rateLossCap}%`, value: v.lossRatioCap },
            { label: 'Loss Ratio Cap on UEP', value: v.lossRatioCapUEP },
            { label: 'Other Expenses Incurred', value: v.otherExpenses, isBold: true, borderClass: 'single-underline' },
            { label: 'Total Profit (Loss)', value: v.totalProfit, isBold: true, borderClass: 'double-underline' },
            { label: 'Reinsurance Brokerage Fee', value: 0 },
            { label: 'Net Settlement due to/(from) Reinsurer', value: v.netSettlement, isBold: true, borderClass: 'double-underline' },
            { label: 'Loss Funding', value: 0 },
            { label: 'Net Settlement due from NTA', value: v.netSettlementFuturistic, isBold: true, borderClass: 'double-underline' },
            { label: 'Fronting Fee @ 5% (paid by separate wire from NTA)', value: v.frontingFee },
            { label: 'Fronting Fee on UEP', value: v.frontingFeeUEP },
            { label: 'Total Fees Earned - SSIC', value: v.totalFeesEarned, isBold: true, borderClass: 'double-underline' },
            { label: 'Unearned Premium Reserve', value: v.currUEP, isBold: true },
            { label: 'Loss Reserves', value: v.currLossReserves },
            { label: 'Loss IBNR Reserves', value: v.currLossIBNR },
            { label: 'LAE Reserves - DCC', value: v.currDCCReserves },
            { label: 'LAE IBNR Reserves - DCC', value: v.currDCCIBNR },
            { label: 'LAE Reserves - AOE', value: v.currAOEReserves },
            { label: 'LAE IBNR Reserves - AOE', value: v.currAOEIBNR_val },
            { label: 'ULAE IBNR Reserves', value: v.currULAEIBNR },
            { label: 'Loss Pick', value: v.lossPick, isRatio: true },
            { label: 'LAE - DCC', value: v.laeDcc, isRatio: true },
            { label: 'LAE - AOE', value: v.laeAoe, isRatio: true },
            { label: 'Total Loss Pick', value: v.totalLossPick, isRatio: true, isBold: true, borderClass: 'single-underline' },
            { label: 'Ultimate Loss', value: v.ultimateLoss },
            { label: 'Ultimate LAE - DCC', value: v.ultimateLAEDcc },
            { label: 'Ultimate LAE - AOE', value: v.ultimateLAEAoe },
            { label: 'Ultimate ULAE', value: v.ultimateULAE },
            { label: '', value: v.totalUltimateLossLAE, borderClass: 'single-underline' },
            { label: 'Loss & LAE Reserves (including IBNR)', value: v.lossLAEReserves, isBold: true, borderClass: 'single-underline' },
            { label: 'Required Collateral at 115%', value: v.requiredCollateral, isBold: true, borderClass: 'double-underline' },
        ];
    }
    async getCashSettlementCalculations(workbookId) {
        const workbook = await this.workbookService.findOne(workbookId);
        const totalEx = workbook.stateExhibits.find(e => e.stateCode === 'TOTAL');
        if (!totalEx) {
            throw new common_1.NotFoundException(`TOTAL state exhibit not found in workbook ${workbook.id}`);
        }
        const qShare = (workbook.rates.qs || 100) / 100;
        const commRate = (workbook.rates.comm || 32) / 100;
        const cfRate = (workbook.rates.cf || 5) / 100;
        const bbRate = (workbook.rates.bb || 0.4) / 100;
        const xolRate = (workbook.rates.xol || 2) / 100;
        const sumArray = (arr) => arr ? arr.reduce((s, v) => s + Number(v || 0), 0) : 0;
        const pw = sumArray(totalEx.pw);
        const pfw = sumArray(totalEx.pfw);
        const pw_tot = pw + pfw;
        const pc = sumArray(totalEx.pc);
        const pfc = sumArray(totalEx.pfc);
        const pc_tot = pc + pfc;
        const reins_comm = pc_tot * qShare * commRate;
        const reins_pf = pfc * qShare;
        const reins_comm_tot = reins_comm + reins_pf;
        const lp = sumArray(totalEx.lp);
        const laep = sumArray(totalEx.laep);
        const ae_paid = sumArray(totalEx.ae_paid);
        const losses_tot = lp + laep + ae_paid;
        const reins_losses_tot = losses_tot * qShare;
        const sub_total = (pc_tot * qShare) - reins_comm_tot - reins_losses_tot;
        const ssic_cf = pc_tot * cfRate;
        const ssic_bb = pw_tot * bbRate;
        const ssic_xol = pw * xolRate;
        const ssic_taxes_tot = ssic_cf + ssic_bb + ssic_xol;
        const reins_bal = sub_total - ssic_bb - ssic_xol;
        const ssic_bal = ssic_taxes_tot;
        const begBal = Number(workbook.cashSettlement?.begBal || 0);
        const amtPaid = Number(workbook.cashSettlement?.amtPaid || 0);
        const ending_bal = ssic_bal + begBal - amtPaid;
        const uep = sumArray(totalEx.uep);
        const lu = sumArray(totalEx.lu);
        const laeu = sumArray(totalEx.laeu);
        const aeu = sumArray(totalEx.aeu);
        const reins_pw = pw * qShare;
        const reins_pfw = pfw * qShare;
        const reins_pw_tot = pw_tot * qShare;
        const reins_pc = pc * qShare;
        const reins_pc_tot = pc_tot * qShare;
        const reins_lp = lp * qShare;
        const reins_laep = laep * qShare;
        const reins_ae_paid = ae_paid * qShare;
        const ssic_pw = pw * (1 - qShare);
        const ssic_pfw = pfw * (1 - qShare);
        const ssic_pw_tot = pw_tot * (1 - qShare);
        const ssic_pc = pc * (1 - qShare);
        const ssic_pfc = pfc * (1 - qShare);
        const ssic_pc_tot = pc_tot * (1 - qShare);
        const ssic_lp = lp * (1 - qShare);
        const ssic_laep = laep * (1 - qShare);
        const ssic_ae_paid = ae_paid * (1 - qShare);
        const ssic_losses_tot = losses_tot * (1 - qShare);
        const ssic_comm = pc_tot * (1 - qShare) * commRate;
        const ssic_pf = pfc * (1 - qShare);
        const ssic_comm_tot = ssic_comm + ssic_pf;
        const total_comm = pc_tot * commRate;
        const total_pf = pfc;
        const total_comm_tot = total_comm + total_pf;
        const total_sub_total = pc_tot - total_comm_tot - losses_tot;
        const ssic_sub_total = pc_tot * (1 - qShare) - ssic_comm_tot - ssic_losses_tot;
        const reins_uep = uep * qShare;
        const reins_lu = lu * qShare;
        const reins_laeu = laeu * qShare;
        const reins_aeu = aeu * qShare;
        const ssic_uep = uep * (1 - qShare);
        const ssic_lu = lu * (1 - qShare);
        const ssic_laeu = laeu * (1 - qShare);
        const ssic_aeu = aeu * (1 - qShare);
        return {
            pw, pfw, pw_tot,
            pc, pfc, pc_tot,
            reins_comm, reins_pf, reins_comm_tot,
            lp, laep, ae_paid, losses_tot, reins_losses_tot,
            sub_total, ssic_cf, ssic_bb, ssic_xol, ssic_taxes_tot,
            reins_bal, ssic_bal, ending_bal,
            uep, lu, laeu, aeu,
            reins_pw, reins_pfw, reins_pw_tot,
            reins_pc, reins_pc_tot,
            reins_lp, reins_laep, reins_ae_paid,
            ssic_pw, ssic_pfw, ssic_pw_tot,
            ssic_pc, ssic_pfc, ssic_pc_tot,
            ssic_lp, ssic_laep, ssic_ae_paid, ssic_losses_tot,
            ssic_comm, ssic_pf, ssic_comm_tot,
            total_comm, total_pf, total_comm_tot,
            total_sub_total, ssic_sub_total,
            reins_uep, reins_lu, reins_laeu, reins_aeu,
            ssic_uep, ssic_lu, ssic_laeu, ssic_aeu,
        };
    }
    calculateCedingValues(workbook, stateCode, prevStateEx) {
        const activeStateEx = workbook.stateExhibits.find(e => e.stateCode === stateCode);
        if (!activeStateEx) {
            throw new common_1.NotFoundException(`State exhibit for ${stateCode} not found in workbook ${workbook.id}`);
        }
        const sum = (arr) => arr ? arr.reduce((s, v) => s + Number(v || 0), 0) : 0;
        const pw = sum(activeStateEx.pw);
        const currUEP = sum(activeStateEx.uep);
        const lossesPaid = sum(activeStateEx.lp);
        console.log(`[ReportsService] calculateCedingValues for ${stateCode}:`);
        console.log(`  Active exhibit source: ${workbook.source}, has prevStateEx: ${!!prevStateEx}`);
        console.log(`  Active loss_ibnr: ${JSON.stringify(activeStateEx.loss_ibnr)}, lae_ibnr_dcc: ${JSON.stringify(activeStateEx.lae_ibnr_dcc)}, ulae_ibnr: ${JSON.stringify(activeStateEx.ulae_ibnr)}`);
        if (prevStateEx) {
            console.log(`  Prev loss_ibnr: ${JSON.stringify(prevStateEx.loss_ibnr)}, lae_ibnr_dcc: ${JSON.stringify(prevStateEx.lae_ibnr_dcc)}, ulae_ibnr: ${JSON.stringify(prevStateEx.ulae_ibnr)}`);
        }
        const rateComm = workbook.rates.comm ?? 32.0;
        const rateUlae = workbook.rates.ulae ?? 1.0;
        const lossPick = workbook.rates.lossPick ?? 51.8;
        const laeDcc = workbook.rates.laeDcc ?? 6.2;
        const laeAoe = workbook.rates.laeAoe ?? 0.0;
        const rateBoards = workbook.rates.boardsCharge ?? 0.40;
        const rateLossCap = workbook.rates.lossRatioCap ?? 2.0;
        const isDccActive = laeDcc > 0;
        const isAoeActive = laeAoe > 0;
        let dccPaid = 0;
        let aoePaid = 0;
        if (workbook.source === 'FUT') {
            const rawLaep = sum(activeStateEx.laep);
            if (isDccActive) {
                dccPaid = rawLaep;
                aoePaid = 0;
            }
            else if (isAoeActive) {
                aoePaid = rawLaep;
                dccPaid = 0;
            }
            else {
                dccPaid = 0;
                aoePaid = 0;
            }
        }
        else {
            const rawLaep = sum(activeStateEx.laep);
            const rawAePaid = sum(activeStateEx.ae_paid);
            if (isDccActive) {
                dccPaid = rawLaep + rawAePaid;
                aoePaid = 0;
            }
            else if (isAoeActive) {
                aoePaid = rawAePaid + rawLaep;
                dccPaid = 0;
            }
            else {
                dccPaid = 0;
                aoePaid = 0;
            }
        }
        let prevUEP = 0;
        let prevLossReserves = 0;
        let prevLossIBNR = 0;
        let prevDCCReserves = 0;
        let prevDCCIBNR = 0;
        let prevAOEReserves = 0;
        let prevAOEIBNR = 0;
        let prevULAEIBNR = 0;
        if (prevStateEx) {
            prevUEP = sum(prevStateEx.uep);
            const prevSource = prevStateEx.workbook?.source;
            if (prevSource === 'FUT') {
                const hasPrevDetailedReserves = prevStateEx && ((prevStateEx.loss_ibnr && prevStateEx.loss_ibnr.some(v => Number(v) !== 0)) ||
                    (prevStateEx.lae_ibnr_dcc && prevStateEx.lae_ibnr_dcc.some(v => Number(v) !== 0)) ||
                    (prevStateEx.lae_ibnr_aoe && prevStateEx.lae_ibnr_aoe.some(v => Number(v) !== 0)) ||
                    (prevStateEx.ulae_ibnr && prevStateEx.ulae_ibnr.some(v => Number(v) !== 0)));
                if (hasPrevDetailedReserves) {
                    prevLossReserves = prevStateEx.loss_reserves ? sum(prevStateEx.loss_reserves) : 0;
                    prevLossIBNR = prevStateEx.loss_ibnr ? sum(prevStateEx.loss_ibnr) : 0;
                    prevULAEIBNR = prevStateEx.ulae_ibnr ? sum(prevStateEx.ulae_ibnr) : 0;
                    if (isDccActive) {
                        prevDCCReserves = (prevStateEx.lae_reserves_dcc ? sum(prevStateEx.lae_reserves_dcc) : 0) +
                            (prevStateEx.lae_reserves_aoe ? sum(prevStateEx.lae_reserves_aoe) : 0);
                        prevDCCIBNR = (prevStateEx.lae_ibnr_dcc ? sum(prevStateEx.lae_ibnr_dcc) : 0) +
                            (prevStateEx.lae_ibnr_aoe ? sum(prevStateEx.lae_ibnr_aoe) : 0);
                        prevAOEReserves = 0;
                        prevAOEIBNR = 0;
                    }
                    else if (isAoeActive) {
                        prevAOEReserves = (prevStateEx.lae_reserves_aoe ? sum(prevStateEx.lae_reserves_aoe) : 0) +
                            (prevStateEx.lae_reserves_dcc ? sum(prevStateEx.lae_reserves_dcc) : 0);
                        prevAOEIBNR = (prevStateEx.lae_ibnr_aoe ? sum(prevStateEx.lae_ibnr_aoe) : 0) +
                            (prevStateEx.lae_ibnr_dcc ? sum(prevStateEx.lae_ibnr_dcc) : 0);
                        prevDCCReserves = 0;
                        prevDCCIBNR = 0;
                    }
                    else {
                        prevDCCReserves = 0;
                        prevDCCIBNR = 0;
                        prevAOEReserves = 0;
                        prevAOEIBNR = 0;
                    }
                }
                else {
                    prevLossReserves = 0;
                    prevLossIBNR = prevStateEx.lu ? sum(prevStateEx.lu) : 0;
                    prevULAEIBNR = prevStateEx.aeu ? sum(prevStateEx.aeu) : 0;
                    if (isDccActive) {
                        prevDCCReserves = 0;
                        prevDCCIBNR = prevStateEx.laeu ? sum(prevStateEx.laeu) : 0;
                        prevAOEReserves = 0;
                        prevAOEIBNR = 0;
                    }
                    else if (isAoeActive) {
                        prevAOEReserves = 0;
                        prevAOEIBNR = prevStateEx.laeu ? sum(prevStateEx.laeu) : 0;
                        prevDCCReserves = 0;
                        prevDCCIBNR = 0;
                    }
                    else {
                        prevDCCReserves = 0;
                        prevDCCIBNR = 0;
                        prevAOEReserves = 0;
                        prevAOEIBNR = 0;
                    }
                }
            }
            else {
                prevLossReserves = prevStateEx.loss_reserves ? sum(prevStateEx.loss_reserves) : 0;
                prevLossIBNR = prevStateEx.loss_ibnr ? sum(prevStateEx.loss_ibnr) : 0;
                prevULAEIBNR = prevStateEx.ulae_ibnr ? sum(prevStateEx.ulae_ibnr) : 0;
                if (isDccActive) {
                    prevDCCReserves = (prevStateEx.lae_reserves_dcc ? sum(prevStateEx.lae_reserves_dcc) : 0) +
                        (prevStateEx.lae_reserves_aoe ? sum(prevStateEx.lae_reserves_aoe) : 0);
                    prevDCCIBNR = (prevStateEx.lae_ibnr_dcc ? sum(prevStateEx.lae_ibnr_dcc) : 0) +
                        (prevStateEx.lae_ibnr_aoe ? sum(prevStateEx.lae_ibnr_aoe) : 0);
                    prevAOEReserves = 0;
                    prevAOEIBNR = 0;
                }
                else if (isAoeActive) {
                    prevAOEReserves = (prevStateEx.lae_reserves_aoe ? sum(prevStateEx.lae_reserves_aoe) : 0) +
                        (prevStateEx.lae_reserves_dcc ? sum(prevStateEx.lae_reserves_dcc) : 0);
                    prevAOEIBNR = (prevStateEx.lae_ibnr_aoe ? sum(prevStateEx.lae_ibnr_aoe) : 0) +
                        (prevStateEx.lae_ibnr_dcc ? sum(prevStateEx.lae_ibnr_dcc) : 0);
                    prevDCCReserves = 0;
                    prevDCCIBNR = 0;
                }
                else {
                    prevDCCReserves = 0;
                    prevDCCIBNR = 0;
                    prevAOEReserves = 0;
                    prevAOEIBNR = 0;
                }
            }
        }
        else if (workbook.source === 'ITD') {
            prevLossReserves = activeStateEx.loss_reserves ? sum(activeStateEx.loss_reserves) : 0;
            prevLossIBNR = activeStateEx.loss_ibnr ? sum(activeStateEx.loss_ibnr) : 0;
            prevULAEIBNR = activeStateEx.ulae_ibnr ? sum(activeStateEx.ulae_ibnr) : 0;
            if (isDccActive) {
                prevDCCReserves = (activeStateEx.lae_reserves_dcc ? sum(activeStateEx.lae_reserves_dcc) : 0) +
                    (activeStateEx.lae_reserves_aoe ? sum(activeStateEx.lae_reserves_aoe) : 0);
                prevDCCIBNR = (activeStateEx.lae_ibnr_dcc ? sum(activeStateEx.lae_ibnr_dcc) : 0) +
                    (activeStateEx.lae_ibnr_aoe ? sum(activeStateEx.lae_ibnr_aoe) : 0);
                prevAOEReserves = 0;
                prevAOEIBNR = 0;
            }
            else if (isAoeActive) {
                prevAOEReserves = (activeStateEx.lae_reserves_aoe ? sum(activeStateEx.lae_reserves_aoe) : 0) +
                    (activeStateEx.lae_reserves_dcc ? sum(activeStateEx.lae_reserves_dcc) : 0);
                prevAOEIBNR = (activeStateEx.lae_ibnr_aoe ? sum(activeStateEx.lae_ibnr_aoe) : 0) +
                    (activeStateEx.lae_ibnr_dcc ? sum(activeStateEx.lae_ibnr_dcc) : 0);
                prevDCCReserves = 0;
                prevDCCIBNR = 0;
            }
            else {
                prevDCCReserves = 0;
                prevDCCIBNR = 0;
                prevAOEReserves = 0;
                prevAOEIBNR = 0;
            }
        }
        else if (workbook.source === 'Starlight') {
            prevUEP = Number(activeStateEx.tax[1] || 0);
            prevLossReserves = activeStateEx.loss_reserves ? sum(activeStateEx.loss_reserves) : 0;
            prevLossIBNR = activeStateEx.loss_ibnr ? sum(activeStateEx.loss_ibnr) : 0;
            prevULAEIBNR = activeStateEx.ulae_ibnr ? sum(activeStateEx.ulae_ibnr) : 0;
            if (isDccActive) {
                prevDCCReserves = (activeStateEx.lae_reserves_dcc ? sum(activeStateEx.lae_reserves_dcc) : 0) +
                    (activeStateEx.lae_reserves_aoe ? sum(activeStateEx.lae_reserves_aoe) : 0);
                prevDCCIBNR = (activeStateEx.lae_ibnr_dcc ? sum(activeStateEx.lae_ibnr_dcc) : 0) +
                    (activeStateEx.lae_ibnr_aoe ? sum(activeStateEx.lae_ibnr_aoe) : 0);
                prevAOEReserves = 0;
                prevAOEIBNR = 0;
            }
            else if (isAoeActive) {
                prevAOEReserves = (activeStateEx.lae_reserves_aoe ? sum(activeStateEx.lae_reserves_aoe) : 0) +
                    (activeStateEx.lae_reserves_dcc ? sum(activeStateEx.lae_reserves_dcc) : 0);
                prevAOEIBNR = (activeStateEx.lae_ibnr_aoe ? sum(activeStateEx.lae_ibnr_aoe) : 0) +
                    (activeStateEx.lae_ibnr_dcc ? sum(activeStateEx.lae_ibnr_dcc) : 0);
                prevDCCReserves = 0;
                prevDCCIBNR = 0;
            }
            else {
                prevDCCReserves = 0;
                prevDCCIBNR = 0;
                prevAOEReserves = 0;
                prevAOEIBNR = 0;
            }
        }
        console.log(`  Computed prev values: lossReserves=${prevLossReserves}, lossIBNR=${prevLossIBNR}, dccReserves=${prevDCCReserves}, dccIBNR=${prevDCCIBNR}, aoeReserves=${prevAOEReserves}, aoeIBNR=${prevAOEIBNR}, ulaeIBNR=${prevULAEIBNR}`);
        const changeUEP = prevUEP - currUEP;
        const premiumsEarned = pw + changeUEP;
        const cedingCommission = pw * (rateComm / 100);
        const commissionUEP = 0.0;
        const commissionEarned = cedingCommission + commissionUEP;
        const hasReserves = sum(activeStateEx.loss_reserves) !== 0 ||
            sum(activeStateEx.loss_ibnr) !== 0 ||
            sum(activeStateEx.lae_reserves_dcc) !== 0 ||
            sum(activeStateEx.lae_ibnr_dcc) !== 0 ||
            sum(activeStateEx.lae_reserves_aoe) !== 0 ||
            sum(activeStateEx.lae_ibnr_aoe) !== 0 ||
            sum(activeStateEx.ulae_ibnr) !== 0;
        const hasPrevReserves = prevStateEx !== null && (sum(prevStateEx.loss_ibnr) !== 0 ||
            sum(prevStateEx.loss_reserves) !== 0 ||
            sum(prevStateEx.lae_ibnr_dcc) !== 0 ||
            sum(prevStateEx.lae_reserves_dcc) !== 0 ||
            sum(prevStateEx.lae_ibnr_aoe) !== 0 ||
            sum(prevStateEx.lae_reserves_aoe) !== 0 ||
            sum(prevStateEx.ulae_ibnr) !== 0);
        let currLossReserves = 0;
        let currLossIBNR = 0;
        let changeLossReserves = 0;
        let changeLossIBNR = 0;
        let lossesIncurred = 0;
        let currDCCReserves = 0;
        let currDCCIBNR = 0;
        let changeDCCReserves = 0;
        let changeDCCIBNR = 0;
        let dccIncurred = 0;
        let currAOEReserves = 0;
        let currAOEIBNR_val = 0;
        let changeAOEReserves = 0;
        let changeAOEIBNR = 0;
        let aoeIncurred = 0;
        let ulaePaid = pw * (rateUlae / 100);
        let currULAEIBNR = 0;
        let changeULAEIBNR = 0;
        let ulaeIncurred = 0;
        if (workbook.source === 'FUT') {
            currLossReserves = sum(activeStateEx.lu);
            if (isDccActive) {
                currDCCReserves = sum(activeStateEx.laeu) + sum(activeStateEx.aeu);
                currAOEReserves = 0;
            }
            else if (isAoeActive) {
                currAOEReserves = sum(activeStateEx.laeu) + sum(activeStateEx.aeu);
                currDCCReserves = 0;
            }
            else {
                currDCCReserves = 0;
                currAOEReserves = 0;
            }
            const ultimateLoss = premiumsEarned * (lossPick / 100);
            const ultimateLAEDcc = premiumsEarned * (laeDcc / 100);
            const ultimateLAEAoe = premiumsEarned * (laeAoe / 100);
            changeLossReserves = currLossReserves - prevLossReserves;
            changeLossIBNR = ultimateLoss - lossesPaid - changeLossReserves;
            currLossIBNR = prevLossIBNR + changeLossIBNR;
            lossesIncurred = lossesPaid + changeLossReserves + changeLossIBNR;
            changeDCCReserves = currDCCReserves - prevDCCReserves;
            changeDCCIBNR = ultimateLAEDcc - dccPaid - changeDCCReserves;
            currDCCIBNR = prevDCCIBNR + changeDCCIBNR;
            dccIncurred = dccPaid + changeDCCReserves + changeDCCIBNR;
            changeAOEReserves = currAOEReserves - prevAOEReserves;
            changeAOEIBNR = ultimateLAEAoe - aoePaid - changeAOEReserves;
            currAOEIBNR_val = prevAOEIBNR + changeAOEIBNR;
            aoeIncurred = aoePaid + changeAOEReserves + changeAOEIBNR;
            changeULAEIBNR = (0.5 * changeLossReserves + changeLossIBNR) * 0.005;
            currULAEIBNR = prevULAEIBNR + changeULAEIBNR;
            ulaeIncurred = ulaePaid + changeULAEIBNR;
        }
        else if (hasReserves || hasPrevReserves) {
            currLossReserves = sum(activeStateEx.loss_reserves);
            currLossIBNR = sum(activeStateEx.loss_ibnr);
            currULAEIBNR = sum(activeStateEx.ulae_ibnr);
            if (isDccActive) {
                currDCCReserves = sum(activeStateEx.lae_reserves_dcc) + sum(activeStateEx.lae_reserves_aoe);
                currDCCIBNR = sum(activeStateEx.lae_ibnr_dcc) + sum(activeStateEx.lae_ibnr_aoe);
                currAOEReserves = 0;
                currAOEIBNR_val = 0;
            }
            else if (isAoeActive) {
                currAOEReserves = sum(activeStateEx.lae_reserves_aoe) + sum(activeStateEx.lae_reserves_dcc);
                currAOEIBNR_val = sum(activeStateEx.lae_ibnr_aoe) + sum(activeStateEx.lae_ibnr_dcc);
                currDCCReserves = 0;
                currDCCIBNR = 0;
            }
            else {
                currDCCReserves = 0;
                currDCCIBNR = 0;
                currAOEReserves = 0;
                currAOEIBNR_val = 0;
            }
            changeLossReserves = currLossReserves - prevLossReserves;
            changeLossIBNR = currLossIBNR - prevLossIBNR;
            lossesIncurred = lossesPaid + changeLossReserves + changeLossIBNR;
            changeDCCReserves = currDCCReserves - prevDCCReserves;
            changeDCCIBNR = currDCCIBNR - prevDCCIBNR;
            dccIncurred = dccPaid + changeDCCReserves + changeDCCIBNR;
            changeAOEReserves = currAOEReserves - prevAOEReserves;
            changeAOEIBNR = currAOEIBNR_val - prevAOEIBNR;
            aoeIncurred = aoePaid + changeAOEReserves + changeAOEIBNR;
            changeULAEIBNR = currULAEIBNR - prevULAEIBNR;
            ulaeIncurred = ulaePaid + changeULAEIBNR;
        }
        else {
            const lossRes = this.lossIbnrService.calculateLossReserves(premiumsEarned, prevLossIBNR, lossPick);
            const laeRes = this.laeIbnrService.calculateLAEReserves(premiumsEarned, prevDCCIBNR || prevAOEIBNR, laeDcc, laeAoe);
            const ulaeRes = this.ulaeIbnrService.calculateULAEReserves(pw, rateUlae, lossRes.changeLossIBNR, prevULAEIBNR);
            currLossReserves = 0;
            currLossIBNR = lossRes.currLossIBNR;
            changeLossReserves = lossRes.changeLossReserves;
            changeLossIBNR = lossRes.changeLossIBNR;
            lossesIncurred = lossRes.lossesIncurred;
            ulaePaid = ulaeRes.ulaePaid;
            currULAEIBNR = ulaeRes.currULAEIBNR;
            changeULAEIBNR = ulaeRes.changeULAEIBNR;
            ulaeIncurred = ulaeRes.ulaeIncurred;
            if (isDccActive) {
                currDCCReserves = 0;
                currDCCIBNR = laeRes.currDCCIBNR;
                changeDCCReserves = laeRes.changeDCCReserves;
                changeDCCIBNR = laeRes.changeDCCIBNR;
                dccIncurred = laeRes.dccIncurred;
                currAOEReserves = 0;
                currAOEIBNR_val = 0;
                changeAOEReserves = 0;
                changeAOEIBNR = 0;
                aoeIncurred = 0;
            }
            else if (isAoeActive) {
                currAOEReserves = 0;
                currAOEIBNR_val = laeRes.currAOEIBNR;
                changeAOEReserves = laeRes.changeAOEReserves;
                changeAOEIBNR = laeRes.changeAOEIBNR;
                aoeIncurred = laeRes.aoeIncurred;
                currDCCReserves = 0;
                currDCCIBNR = 0;
                changeDCCReserves = 0;
                changeDCCIBNR = 0;
                dccIncurred = 0;
            }
            else {
                currDCCReserves = 0;
                currDCCIBNR = 0;
                changeDCCReserves = 0;
                changeDCCIBNR = 0;
                dccIncurred = 0;
                currAOEReserves = 0;
                currAOEIBNR_val = 0;
                changeAOEReserves = 0;
                changeAOEIBNR = 0;
                aoeIncurred = 0;
            }
        }
        const laeIncurred = dccIncurred + aoeIncurred + ulaeIncurred;
        const boardsCharge = pw * (rateBoards / 100);
        const boardsUEP = changeUEP * (rateBoards / 100);
        const lossRatioCap = pw * (rateLossCap / 100);
        const lossRatioCapUEP = changeUEP * (rateLossCap / 100);
        const otherExpenses = boardsCharge + boardsUEP + lossRatioCap + lossRatioCapUEP;
        const totalProfit = premiumsEarned - commissionEarned - lossesIncurred - laeIncurred - otherExpenses;
        const netSettlement = pw - cedingCommission - lossesPaid - dccPaid - aoePaid - ulaePaid - boardsCharge - lossRatioCap;
        const netSettlementFuturistic = pw - cedingCommission - lossesPaid - dccPaid - aoePaid - ulaePaid;
        const frontingFee = pw * 0.05;
        const frontingFeeUEP = changeUEP * 0.05;
        const totalFeesEarned = boardsCharge + boardsUEP + lossRatioCap + lossRatioCapUEP + frontingFee + frontingFeeUEP;
        const totalLossPick = lossPick + laeDcc + laeAoe;
        const ultimateLoss = lossesIncurred;
        const ultimateLAEDcc = dccIncurred;
        const ultimateLAEAoe = aoeIncurred;
        const ultimateULAE = ulaeIncurred;
        const totalUltimateLossLAE = ultimateLoss + ultimateLAEDcc + ultimateLAEAoe + ultimateULAE;
        const lossLAEReserves = currLossReserves + currLossIBNR + currDCCReserves + currDCCIBNR + currAOEReserves + currAOEIBNR_val + currULAEIBNR;
        const requiredCollateral = lossLAEReserves * 1.15;
        return {
            premiumWritten: pw,
            changeUEP,
            premiumsEarned,
            cedingCommission,
            commissionUEP,
            commissionEarned,
            lossesPaid,
            changeLossReserves,
            changeLossIBNR,
            lossesIncurred,
            dccPaid,
            changeDCCReserves,
            changeDCCIBNR,
            dccIncurred,
            aoePaid,
            changeAOEReserves,
            changeAOEIBNR,
            aoeIncurred,
            ulaePaid,
            changeULAEIBNR,
            ulaeIncurred,
            laeIncurred,
            boardsCharge,
            boardsUEP,
            lossRatioCap,
            lossRatioCapUEP,
            otherExpenses,
            totalProfit,
            netSettlement,
            netSettlementFuturistic,
            frontingFee,
            frontingFeeUEP,
            totalFeesEarned,
            currUEP,
            currLossReserves,
            currLossIBNR,
            currDCCReserves,
            currDCCIBNR,
            currAOEReserves,
            currAOEIBNR_val,
            currULAEIBNR,
            lossPick,
            laeDcc,
            laeAoe,
            totalLossPick,
            ultimateLoss,
            ultimateLAEDcc,
            ultimateLAEAoe,
            ultimateULAE,
            totalUltimateLossLAE,
            lossLAEReserves,
            requiredCollateral,
        };
    }
    async getPreviousStateExhibit(workbook, stateCode) {
        const prevWb = await this.workbookService.findPreviousWorkbookFor(workbook);
        if (!prevWb || !prevWb.stateExhibits)
            return null;
        const ex = prevWb.stateExhibits.find(e => e.stateCode === stateCode) || null;
        if (ex) {
            ex.workbook = prevWb;
        }
        return ex;
    }
    getPreviousMonthKey(monthKey) {
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workbook_service_1.WorkbookService,
        loss_ibnr_service_1.LossIbnrService,
        lae_ibnr_service_1.LaeIbnrService,
        ulae_ibnr_service_1.UlaeIbnrService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map