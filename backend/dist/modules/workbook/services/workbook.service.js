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
const excel_parser_service_1 = require("./excel-parser.service");
let WorkbookService = class WorkbookService {
    workbookRepo;
    stateExhibitRepo;
    cashSettlementRepo;
    excelParserService;
    constructor(workbookRepo, stateExhibitRepo, cashSettlementRepo, excelParserService) {
        this.workbookRepo = workbookRepo;
        this.stateExhibitRepo = stateExhibitRepo;
        this.cashSettlementRepo = cashSettlementRepo;
        this.excelParserService = excelParserService;
    }
    async findAll() {
        return this.workbookRepo.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const workbook = await this.workbookRepo.findOne({
            where: { id },
            relations: { stateExhibits: true, cashSettlement: true },
        });
        if (!workbook) {
            throw new common_1.NotFoundException(`Workbook with ID ${id} not found`);
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
    async uploadWorkbook(fileBuffer, filename, forceOverwrite = false) {
        return this.excelParserService.parseWorkbook(fileBuffer, filename, forceOverwrite);
    }
    async generateITDExcel(fileBuffer) {
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
        Object.keys(dto).forEach((key) => {
            if (dto[key] !== undefined) {
                exhibit[key] = dto[key];
            }
        });
        const savedExhibit = await this.stateExhibitRepo.save(exhibit);
        await this.recalculateTotalExhibit(workbookId);
        return savedExhibit;
    }
    async updateRates(workbookId, dto) {
        const workbook = await this.findOne(workbookId);
        workbook.rates = {
            ...workbook.rates,
            ...dto,
        };
        return this.workbookRepo.save(workbook);
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
            totalExhibit[field] = sums;
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        excel_parser_service_1.ExcelParserService])
], WorkbookService);
//# sourceMappingURL=workbook.service.js.map