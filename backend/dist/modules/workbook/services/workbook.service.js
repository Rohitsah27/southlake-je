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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkbookService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workbook_entity_1 = require("../entities/workbook.entity");
const state_exhibit_entity_1 = require("../entities/state-exhibit.entity");
const cash_settlement_entity_1 = require("../entities/cash-settlement.entity");
const program_entity_1 = require("../entities/program.entity");
const excel_parser_service_1 = require("./excel-parser.service");
let WorkbookService = class WorkbookService {
    workbookRepo;
    stateExhibitRepo;
    cashSettlementRepo;
    programRepo;
    excelParserService;
    constructor(workbookRepo, stateExhibitRepo, cashSettlementRepo, programRepo, excelParserService) {
        this.workbookRepo = workbookRepo;
        this.stateExhibitRepo = stateExhibitRepo;
        this.cashSettlementRepo = cashSettlementRepo;
        this.programRepo = programRepo;
        this.excelParserService = excelParserService;
    }
    async findPrograms() {
        return this.programRepo.find({ order: { name: 'ASC' } });
    }
    async createProgram(name, rates) {
        const existing = await this.programRepo.findOne({ where: { name } });
        if (existing) {
            existing.rates = rates;
            return this.programRepo.save(existing);
        }
        const program = this.programRepo.create({ name, rates });
        return this.programRepo.save(program);
    }
    async findAll() {
        return this.workbookRepo.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        let workbook = await this.workbookRepo.findOne({
            where: { id },
            relations: { stateExhibits: true, cashSettlement: true },
        });
        if (!workbook) {
            throw new common_1.NotFoundException(`Workbook with ID ${id} not found`);
        }
        if (workbook.source === 'FUT') {
            await this.recalculateFUTReserves(id);
            const reloaded = await this.workbookRepo.findOne({
                where: { id },
                relations: { stateExhibits: true, cashSettlement: true },
            });
            if (reloaded) {
                workbook = reloaded;
            }
        }
        if (workbook.stateExhibits) {
            workbook.stateExhibits.sort((a, b) => {
                if (a.stateCode === 'TOTAL')
                    return -1;
                if (b.stateCode === 'TOTAL')
                    return 1;
                return a.stateCode.localeCompare(b.stateCode);
            });
        }
        return workbook;
    }
    async delete(id) {
        const workbook = await this.findOne(id);
        await this.workbookRepo.remove(workbook);
    }
    async uploadWorkbook(fileBuffer, filename, forceOverwrite = false, program) {
        const result = await this.excelParserService.parseWorkbook(fileBuffer, filename, forceOverwrite, program);
        if (result && result.workbook && result.workbook.source === 'FUT') {
            await this.recalculateFUTReserves(result.workbook.id);
            result.workbook = await this.findOne(result.workbook.id);
        }
        return result;
    }
    async generateITDExcel(fileBuffer, program) {
        return this.excelParserService.generateITDWorkbookFromStarlight(fileBuffer);
    }
    async updateMappings(workbookId, dto) {
        const workbook = await this.findOne(workbookId);
        if (dto.mga !== undefined)
            workbook.mga = dto.mga;
        if (dto.lob !== undefined)
            workbook.lob = dto.lob;
        if (dto.lineDescSuffix !== undefined)
            workbook.lineDescSuffix = dto.lineDescSuffix;
        if (dto.comp !== undefined)
            workbook.comp = dto.comp;
        if (dto.cc !== undefined)
            workbook.cc = dto.cc;
        if (dto.ext !== undefined)
            workbook.ext = dto.ext;
        if (dto.sub !== undefined)
            workbook.sub = dto.sub;
        return this.workbookRepo.save(workbook);
    }
    async updateExhibit(workbookId, stateCode, dto) {
        const workbook = await this.findOne(workbookId);
        const exhibit = workbook.stateExhibits.find((e) => e.stateCode === stateCode);
        if (!exhibit) {
            throw new common_1.NotFoundException(`State exhibit ${stateCode} not found in workbook ${workbookId}`);
        }
        if (stateCode === 'TOTAL') {
            const fields = Object.keys(dto);
            const nonTotalExhibits = workbook.stateExhibits.filter((e) => e.stateCode !== 'TOTAL');
            fields.forEach((field) => {
                const totalValues = dto[field];
                if (totalValues !== undefined) {
                    for (let c = 0; c < 3; c++) {
                        const colTotal = Number(totalValues[c] || 0);
                        const weights = nonTotalExhibits.map((ex) => {
                            const existingVal = Number(ex[field]?.[c] || 0);
                            if (Math.abs(existingVal) > 0.001) {
                                return { ex, val: existingVal, isField: true };
                            }
                            const pwVal = Number(ex.pw?.[c] || 0);
                            if (Math.abs(pwVal) > 0.001) {
                                return { ex, val: pwVal, isField: false };
                            }
                            const pw1Val = Number(ex.pw?.[1] || 0);
                            if (Math.abs(pw1Val) > 0.001) {
                                return { ex, val: pw1Val, isField: false };
                            }
                            return { ex, val: 1, isField: false };
                        });
                        let activeWeights = weights;
                        const hasFieldWeights = weights.some(w => w.isField);
                        if (hasFieldWeights) {
                            activeWeights = weights.map(w => w.isField ? w : { ...w, val: 0 });
                        }
                        const sumWeights = activeWeights.reduce((s, w) => s + Math.abs(w.val), 0);
                        let distributedSum = 0;
                        const stateValues = activeWeights.map((w) => {
                            let val = 0;
                            if (sumWeights > 0.001) {
                                val = (colTotal * Math.abs(w.val)) / sumWeights;
                            }
                            else {
                                val = colTotal / nonTotalExhibits.length;
                            }
                            const roundedVal = Math.round(val * 100) / 100;
                            distributedSum += roundedVal;
                            return roundedVal;
                        });
                        const diff = colTotal - distributedSum;
                        if (Math.abs(diff) > 0.001) {
                            let maxIdx = 0;
                            let maxVal = -1;
                            activeWeights.forEach((w, idx) => {
                                if (Math.abs(w.val) > maxVal) {
                                    maxVal = Math.abs(w.val);
                                    maxIdx = idx;
                                }
                            });
                            stateValues[maxIdx] = Number((stateValues[maxIdx] + diff).toFixed(2));
                        }
                        nonTotalExhibits.forEach((ex, idx) => {
                            if (!ex[field]) {
                                ex[field] = [0, 0, 0];
                            }
                            ex[field][c] = stateValues[idx];
                        });
                    }
                }
            });
            if (nonTotalExhibits.length > 0) {
                await this.stateExhibitRepo.save(nonTotalExhibits);
            }
        }
        Object.keys(dto).forEach((key) => {
            if (dto[key] !== undefined) {
                exhibit[key] = dto[key];
            }
        });
        const savedExhibit = await this.stateExhibitRepo.save(exhibit);
        if (workbook.source === 'FUT') {
            await this.recalculateFUTReserves(workbookId);
        }
        else {
            await this.recalculateTotalExhibit(workbookId);
        }
        const reloadedExhibit = await this.stateExhibitRepo.findOne({
            where: { workbookId, stateCode },
        });
        return reloadedExhibit || savedExhibit;
    }
    async updateRates(workbookId, dto) {
        const workbook = await this.findOne(workbookId);
        workbook.rates = {
            ...workbook.rates,
            ...dto,
        };
        const savedWorkbook = await this.workbookRepo.save(workbook);
        if (savedWorkbook.source === 'FUT') {
            await this.recalculateFUTReserves(workbookId);
        }
        return this.findOne(workbookId);
    }
    async updateCashSettlement(workbookId, dto) {
        const workbook = await this.findOne(workbookId);
        if (!workbook.cashSettlement) {
            workbook.cashSettlement = this.cashSettlementRepo.create({
                workbookId,
                begBal: dto.begBal ?? 0,
                amtPaid: dto.amtPaid ?? 0,
            });
        }
        else {
            if (dto.begBal !== undefined)
                workbook.cashSettlement.begBal = dto.begBal;
            if (dto.amtPaid !== undefined)
                workbook.cashSettlement.amtPaid = dto.amtPaid;
        }
        return this.cashSettlementRepo.save(workbook.cashSettlement);
    }
    async findPreviousWorkbook(program, monthKey, source) {
        return this.workbookRepo.findOne({
            where: { program, monthKey, source },
            relations: { stateExhibits: true },
        });
    }
    async findPreviousWorkbookFor(workbook) {
        if (workbook.monthKey.endsWith('-01')) {
            const itdWb = await this.workbookRepo.findOne({
                where: { program: workbook.program, source: 'ITD' },
                relations: { stateExhibits: true },
                order: { createdAt: 'DESC' },
            });
            if (itdWb)
                return itdWb;
        }
        const prevMonthKey = this.getPreviousMonthKey(workbook.monthKey);
        let prevWb = await this.workbookRepo.findOne({
            where: { program: workbook.program, monthKey: prevMonthKey, source: workbook.source },
            relations: { stateExhibits: true },
        });
        if (prevWb)
            return prevWb;
        prevWb = await this.workbookRepo.findOne({
            where: { program: workbook.program, monthKey: prevMonthKey },
            relations: { stateExhibits: true },
            order: { createdAt: 'DESC' },
        });
        if (prevWb)
            return prevWb;
        if (workbook.source !== 'ITD') {
            const itdWb = await this.workbookRepo.findOne({
                where: { program: workbook.program, source: 'ITD' },
                relations: { stateExhibits: true },
                order: { createdAt: 'DESC' },
            });
            if (itdWb)
                return itdWb;
        }
        return null;
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
    async recalculateFUTReserves(workbookId) {
        const workbook = await this.workbookRepo.findOne({
            where: { id: workbookId },
            relations: { stateExhibits: true },
        });
        if (!workbook || workbook.source !== 'FUT') {
            return;
        }
        const prevWb = await this.findPreviousWorkbookFor(workbook);
        const prevSource = prevWb?.source;
        const prevStateExhibits = prevWb?.stateExhibits || [];
        const rates = workbook.rates || {};
        const lossPick = rates.lossPick ?? 51.8;
        const laeDcc = rates.laeDcc ?? 6.2;
        const laeAoe = rates.laeAoe ?? 0.0;
        const isDccActive = laeDcc > 0;
        const isAoeActive = laeAoe > 0;
        const nonTotalExhibits = workbook.stateExhibits.filter((e) => e.stateCode !== 'TOTAL');
        for (const ex of nonTotalExhibits) {
            const prevEx = prevStateExhibits.find((pe) => pe.stateCode === ex.stateCode);
            const pw = ex.pw || [0, 0, 0];
            const uep = ex.uep || [0, 0, 0];
            const lp = ex.lp || [0, 0, 0];
            const laep = ex.laep || [0, 0, 0];
            const lu = ex.lu || [0, 0, 0];
            const laeu = ex.laeu || [0, 0, 0];
            const aeu = ex.aeu || [0, 0, 0];
            const prev_uep = prevEx?.uep || [0, 0, 0];
            const prev_lu = prevEx?.lu || [0, 0, 0];
            const prev_laeu = prevEx?.laeu || [0, 0, 0];
            const prev_aeu = prevEx?.aeu || [0, 0, 0];
            const loss_reserves = [0, 0, 0];
            const loss_ibnr = [0, 0, 0];
            const lae_reserves_dcc = [0, 0, 0];
            const lae_ibnr_dcc = [0, 0, 0];
            const lae_reserves_aoe = [0, 0, 0];
            const lae_ibnr_aoe = [0, 0, 0];
            const ulae_ibnr = [0, 0, 0];
            for (let c = 0; c < 3; c++) {
                const pwVal = Number(pw[c] || 0);
                const currUEP = Number(uep[c] || 0);
                const lossesPaid = Number(lp[c] || 0);
                let dccPaid = 0;
                let aoePaid = 0;
                const rawLaep = Number(laep[c] || 0);
                if (isDccActive) {
                    dccPaid = rawLaep;
                    aoePaid = 0;
                }
                else if (isAoeActive) {
                    aoePaid = rawLaep;
                    dccPaid = 0;
                }
                let prevUEPVal = 0;
                let prevLossReservesVal = 0;
                let prevLossIBNRVal = 0;
                let prevDCCReservesVal = 0;
                let prevDCCIBNRVal = 0;
                let prevAOEReservesVal = 0;
                let prevAOEIBNRVal = 0;
                let prevULAEIBNRVal = 0;
                if (prevEx) {
                    prevUEPVal = Number(prev_uep[c] || 0);
                    if (prevSource === 'FUT') {
                        const hasPrevDetailedReserves = prevEx && (prevEx.loss_ibnr?.some(v => Number(v) !== 0) ||
                            prevEx.lae_ibnr_dcc?.some(v => Number(v) !== 0) ||
                            prevEx.lae_ibnr_aoe?.some(v => Number(v) !== 0) ||
                            prevEx.ulae_ibnr?.some(v => Number(v) !== 0));
                        if (hasPrevDetailedReserves) {
                            prevLossReservesVal = Number(prevEx.loss_reserves?.[c] || 0);
                            prevLossIBNRVal = Number(prevEx.loss_ibnr?.[c] || 0);
                            prevULAEIBNRVal = Number(prevEx.ulae_ibnr?.[c] || 0);
                            if (isDccActive) {
                                prevDCCReservesVal = Number(prevEx.lae_reserves_dcc?.[c] || 0) + Number(prevEx.lae_reserves_aoe?.[c] || 0);
                                prevDCCIBNRVal = Number(prevEx.lae_ibnr_dcc?.[c] || 0) + Number(prevEx.lae_ibnr_aoe?.[c] || 0);
                                prevAOEReservesVal = 0;
                                prevAOEIBNRVal = 0;
                            }
                            else if (isAoeActive) {
                                prevAOEReservesVal = Number(prevEx.lae_reserves_aoe?.[c] || 0) + Number(prevEx.lae_reserves_dcc?.[c] || 0);
                                prevAOEIBNRVal = Number(prevEx.lae_ibnr_aoe?.[c] || 0) + Number(prevEx.lae_ibnr_dcc?.[c] || 0);
                                prevDCCReservesVal = 0;
                                prevDCCIBNRVal = 0;
                            }
                        }
                        else {
                            prevLossReservesVal = 0;
                            prevLossIBNRVal = Number(prev_lu[c] || 0);
                            prevULAEIBNRVal = Number(prev_aeu[c] || 0);
                            if (isDccActive) {
                                prevDCCReservesVal = 0;
                                prevDCCIBNRVal = Number(prev_laeu[c] || 0);
                                prevAOEReservesVal = 0;
                                prevAOEIBNRVal = 0;
                            }
                            else if (isAoeActive) {
                                prevAOEReservesVal = 0;
                                prevAOEIBNRVal = Number(prev_laeu[c] || 0);
                                prevDCCReservesVal = 0;
                                prevDCCIBNRVal = 0;
                            }
                        }
                    }
                    else {
                        prevLossReservesVal = Number(prevEx.loss_reserves?.[c] || 0);
                        prevLossIBNRVal = Number(prevEx.loss_ibnr?.[c] || 0);
                        prevULAEIBNRVal = Number(prevEx.ulae_ibnr?.[c] || 0);
                        if (isDccActive) {
                            prevDCCReservesVal = Number(prevEx.lae_reserves_dcc?.[c] || 0) + Number(prevEx.lae_reserves_aoe?.[c] || 0);
                            prevDCCIBNRVal = Number(prevEx.lae_ibnr_dcc?.[c] || 0) + Number(prevEx.lae_ibnr_aoe?.[c] || 0);
                            prevAOEReservesVal = 0;
                            prevAOEIBNRVal = 0;
                        }
                        else if (isAoeActive) {
                            prevAOEReservesVal = Number(prevEx.lae_reserves_aoe?.[c] || 0) + Number(prevEx.lae_reserves_dcc?.[c] || 0);
                            prevAOEIBNRVal = Number(prevEx.lae_ibnr_aoe?.[c] || 0) + Number(prevEx.lae_ibnr_dcc?.[c] || 0);
                            prevDCCReservesVal = 0;
                            prevDCCIBNRVal = 0;
                        }
                    }
                }
                const changeUEP = prevUEPVal - currUEP;
                const premiumsEarned = pwVal + changeUEP;
                const currLossReservesVal = Number(lu[c] || 0);
                let currDCCReservesVal = 0;
                let currAOEReservesVal = 0;
                if (isDccActive) {
                    currDCCReservesVal = Number(laeu[c] || 0) + Number(aeu[c] || 0);
                    currAOEReservesVal = 0;
                }
                else if (isAoeActive) {
                    currAOEReservesVal = Number(laeu[c] || 0) + Number(aeu[c] || 0);
                    currDCCReservesVal = 0;
                }
                const ultimateLoss = premiumsEarned * (lossPick / 100);
                const ultimateLAEDcc = premiumsEarned * (laeDcc / 100);
                const ultimateLAEAoe = premiumsEarned * (laeAoe / 100);
                const changeLossReserves = currLossReservesVal - prevLossReservesVal;
                const changeLossIBNR = ultimateLoss - lossesPaid - changeLossReserves;
                const currLossIBNRVal = prevLossIBNRVal + changeLossIBNR;
                const changeDCCReserves = currDCCReservesVal - prevDCCReservesVal;
                const changeDCCIBNR = ultimateLAEDcc - dccPaid - changeDCCReserves;
                const currDCCIBNRVal = prevDCCIBNRVal + changeDCCIBNR;
                const changeAOEReserves = currAOEReservesVal - prevAOEReservesVal;
                const changeAOEIBNR = ultimateLAEAoe - aoePaid - changeAOEReserves;
                const currAOEIBNRVal = prevAOEIBNRVal + changeAOEIBNR;
                const changeULAEIBNR = (0.5 * changeLossReserves + changeLossIBNR) * 0.005;
                const currULAEIBNRVal = prevULAEIBNRVal + changeULAEIBNR;
                loss_reserves[c] = Number(currLossReservesVal.toFixed(2));
                loss_ibnr[c] = Number(currLossIBNRVal.toFixed(2));
                lae_reserves_dcc[c] = Number((isDccActive ? currDCCReservesVal : 0).toFixed(2));
                lae_ibnr_dcc[c] = Number((isDccActive ? currDCCIBNRVal : 0).toFixed(2));
                lae_reserves_aoe[c] = Number((isAoeActive ? currAOEReservesVal : 0).toFixed(2));
                lae_ibnr_aoe[c] = Number((isAoeActive ? currAOEIBNRVal : 0).toFixed(2));
                ulae_ibnr[c] = Number(currULAEIBNRVal.toFixed(2));
            }
            ex.loss_reserves = loss_reserves;
            ex.loss_ibnr = loss_ibnr;
            ex.lae_reserves_dcc = lae_reserves_dcc;
            ex.lae_ibnr_dcc = lae_ibnr_dcc;
            ex.lae_reserves_aoe = lae_reserves_aoe;
            ex.lae_ibnr_aoe = lae_ibnr_aoe;
            ex.ulae_ibnr = ulae_ibnr;
        }
        await this.stateExhibitRepo.save(nonTotalExhibits);
        await this.recalculateTotalExhibit(workbookId);
    }
    async recalculateTotalExhibit(workbookId) {
        const allExhibits = await this.stateExhibitRepo.find({ where: { workbookId } });
        const nonTotalExhibits = allExhibits.filter((e) => e.stateCode !== 'TOTAL');
        let totalExhibit = allExhibits.find((e) => e.stateCode === 'TOTAL');
        if (!totalExhibit) {
            totalExhibit = this.stateExhibitRepo.create({
                workbookId,
                stateCode: 'TOTAL',
            });
        }
        const fields = [
            'pw', 'pfw', 'pc', 'pfc', 'tax', 'lp', 'laep', 'ae_paid',
            'pe', 'pfe', 'uep', 'lu', 'laeu', 'aeu',
            'loss_reserves', 'loss_ibnr', 'lae_reserves_dcc', 'lae_ibnr_dcc',
            'lae_reserves_aoe', 'lae_ibnr_aoe', 'ulae_ibnr'
        ];
        fields.forEach((field) => {
            const sums = [0, 0, 0];
            nonTotalExhibits.forEach((ex) => {
                const arr = ex[field] || [];
                for (let i = 0; i < 3; i++) {
                    sums[i] += Number(arr[i] || 0);
                }
            });
            totalExhibit[field] = sums.map((s) => Number(s.toFixed(2)));
        });
        await this.stateExhibitRepo.save(totalExhibit);
    }
};
exports.WorkbookService = WorkbookService;
exports.WorkbookService = WorkbookService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workbook_entity_1.Workbook)),
    __param(1, (0, typeorm_1.InjectRepository)(state_exhibit_entity_1.StateExhibit)),
    __param(2, (0, typeorm_1.InjectRepository)(cash_settlement_entity_1.CashSettlement)),
    __param(3, (0, typeorm_1.InjectRepository)(program_entity_1.Program)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        excel_parser_service_1.ExcelParserService])
], WorkbookService);
//# sourceMappingURL=workbook.service.js.map