"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ItdSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItdSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workbook_entity_1 = require("../../modules/workbook/entities/workbook.entity");
const state_exhibit_entity_1 = require("../../modules/workbook/entities/state-exhibit.entity");
const cash_settlement_entity_1 = require("../../modules/workbook/entities/cash-settlement.entity");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let ItdSeederService = ItdSeederService_1 = class ItdSeederService {
    workbookRepo;
    stateExhibitRepo;
    cashSettlementRepo;
    logger = new common_1.Logger(ItdSeederService_1.name);
    constructor(workbookRepo, stateExhibitRepo, cashSettlementRepo) {
        this.workbookRepo = workbookRepo;
        this.stateExhibitRepo = stateExhibitRepo;
        this.cashSettlementRepo = cashSettlementRepo;
    }
    async clearAllData() {
        this.logger.log('Clearing all database workbook data...');
        const deleteRes = await this.workbookRepo
            .createQueryBuilder()
            .delete()
            .execute();
        this.logger.log(`Clear complete. Affected rows: ${deleteRes.affected}`);
        return {
            success: true,
            message: `Database successfully cleared. Workbooks deleted: ${deleteRes.affected}`,
        };
    }
    async checkItdSeeded() {
        const itdWorkbook = await this.workbookRepo.findOne({
            where: [
                { program: 'DPR APD', source: 'ITD' },
                { program: 'APD Local', source: 'ITD' },
            ],
        });
        return {
            seeded: !!itdWorkbook,
            message: itdWorkbook ? 'ITD data has been seeded.' : 'ITD data has not been seeded yet.',
        };
    }
    async seedItdData() {
        this.logger.log('Starting ITD only database seed operation from separate state files...');
        const statesDir = path.join(process.cwd(), 'src/database/seeds/states');
        const workspaceDir = 'C:/Users/ASUS/Desktop/Treaty - 1/itd_states_seeder_data';
        if (!fs.existsSync(statesDir)) {
            throw new Error(`Seeder states directory not found at ${statesDir}. Please run extraction first.`);
        }
        const files = fs.readdirSync(statesDir).filter(f => f.endsWith('.json'));
        this.logger.log(`Found ${files.length} state JSON files: ${files.join(', ')}`);
        if (files.length === 0) {
            throw new Error(`No state JSON files found under ${statesDir}.`);
        }
        const programsConfig = [
            {
                program: 'DPR APD',
                mga: '2002',
                lob: '000212',
                lineDescSuffix: 'FUT Starlight T2 APD DRP',
                cc: '00',
                rates: {
                    qs: 100,
                    cf: 5,
                    comm: 29.0,
                    bb: 0.40,
                    ulae: 7.0,
                    xol: 2.0,
                    lr: 2.0,
                    lossPick: 61.1,
                    laeDcc: 0.0,
                    laeAoe: 3.4,
                    boardsCharge: 0.40,
                    lossRatioCap: 2.0
                }
            },
            {
                program: 'APD Local',
                mga: '1202',
                lob: '000212',
                lineDescSuffix: 'FUT Starlight T2 APD Local',
                cc: '000',
                rates: {
                    qs: 100,
                    cf: 5,
                    comm: 29.0,
                    bb: 0.40,
                    ulae: 7.0,
                    xol: 2.0,
                    lr: 2.0,
                    lossPick: 61.1,
                    laeDcc: 0.0,
                    laeAoe: 3.4,
                    boardsCharge: 0.40,
                    lossRatioCap: 2.0
                }
            }
        ];
        const results = [];
        for (const config of programsConfig) {
            const existingItd = await this.workbookRepo.find({ where: { program: config.program, source: 'ITD' } });
            if (existingItd.length > 0) {
                this.logger.log(`Removing ${existingItd.length} existing ITD workbook(s) for ${config.program}...`);
                await this.workbookRepo.remove(existingItd);
            }
            const workbook = this.workbookRepo.create({
                program: config.program,
                monthKey: '2025-12',
                monthLabel: 'December 2025',
                source: 'ITD',
                rates: config.rates,
                mga: config.mga,
                lob: config.lob,
                lineDescSuffix: config.lineDescSuffix,
                cc: config.cc,
                comp: '100',
                ext: '0000',
                sub: '',
            });
            const savedWb = await this.workbookRepo.save(workbook);
            this.logger.log(`Created ITD workbook for ${config.program} with ID: ${savedWb.id}`);
            const exhibits = [];
            for (const file of files) {
                const filePath = path.join(statesDir, file);
                const exJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const safeNumArr = (field) => {
                    const val = exJson[field];
                    if (Array.isArray(val) && val.length === 3) {
                        return val.map(v => Number(v) || 0);
                    }
                    return [0, 0, 0];
                };
                const ex = this.stateExhibitRepo.create({
                    workbookId: savedWb.id,
                    stateCode: exJson.stateCode,
                    pw: safeNumArr('pw'),
                    pfw: safeNumArr('pfw'),
                    pc: safeNumArr('pc'),
                    pfc: safeNumArr('pfc'),
                    tax: safeNumArr('tax'),
                    lp: safeNumArr('lp'),
                    laep: safeNumArr('laep'),
                    ae_paid: safeNumArr('ae_paid'),
                    pe: safeNumArr('pe'),
                    pfe: safeNumArr('pfe'),
                    uep: safeNumArr('uep'),
                    lu: safeNumArr('lu'),
                    laeu: safeNumArr('laeu'),
                    aeu: safeNumArr('aeu'),
                    loss_reserves: safeNumArr('loss_reserves'),
                    loss_ibnr: safeNumArr('loss_ibnr'),
                    lae_reserves_dcc: safeNumArr('lae_reserves_dcc'),
                    lae_ibnr_dcc: safeNumArr('lae_ibnr_dcc'),
                    lae_reserves_aoe: safeNumArr('lae_reserves_aoe'),
                    lae_ibnr_aoe: safeNumArr('lae_ibnr_aoe'),
                    ulae_ibnr: safeNumArr('ulae_ibnr'),
                });
                exhibits.push(ex);
            }
            this.logger.log(`Saving ${exhibits.length} exhibits to database...`);
            const savedExhibits = await this.stateExhibitRepo.save(exhibits);
            this.logger.log(`Successfully saved ${savedExhibits.length} exhibits`);
            const cs = this.cashSettlementRepo.create({
                workbookId: savedWb.id,
                begBal: 0,
                amtPaid: 0,
            });
            await this.cashSettlementRepo.save(cs);
            const verifyWb = await this.workbookRepo.findOne({
                where: { id: savedWb.id },
                relations: { stateExhibits: true },
            });
            this.logger.log(`Verification: ITD workbook for ${config.program} has ${verifyWb?.stateExhibits?.length || 0} exhibits`);
            results.push({
                file: `${config.program} - 2025-12`,
                success: true,
                message: `Successfully seeded ITD workbook with ${savedExhibits.length} separate state JSON files.`
            });
        }
        return results;
    }
    async getSeederFiles() {
        let itdWorkbook = await this.workbookRepo.findOne({
            where: { program: 'APD Local', source: 'ITD' },
            relations: { stateExhibits: true },
        });
        if (!itdWorkbook) {
            itdWorkbook = await this.workbookRepo.findOne({
                where: { source: 'ITD' },
                relations: { stateExhibits: true },
            });
        }
        if (!itdWorkbook || !itdWorkbook.stateExhibits || itdWorkbook.stateExhibits.length === 0) {
            this.logger.log('No database ITD workbook found.');
            return [];
        }
        this.logger.log(`Loading ITD editor state data from database workbook ID: ${itdWorkbook.id}`);
        const results = itdWorkbook.stateExhibits.map((ex) => {
            const data = {
                stateCode: ex.stateCode,
                pw: ex.pw || [0, 0, 0],
                pfw: ex.pfw || [0, 0, 0],
                pc: ex.pc || [0, 0, 0],
                pfc: ex.pfc || [0, 0, 0],
                tax: ex.tax || [0, 0, 0],
                lp: ex.lp || [0, 0, 0],
                laep: ex.laep || [0, 0, 0],
                ae_paid: ex.ae_paid || [0, 0, 0],
                pe: ex.pe || [0, 0, 0],
                pfe: ex.pfe || [0, 0, 0],
                uep: ex.uep || [0, 0, 0],
                lu: ex.lu || [0, 0, 0],
                laeu: ex.laeu || [0, 0, 0],
                aeu: ex.aeu || [0, 0, 0],
                loss_reserves: ex.loss_reserves || [0, 0, 0],
                loss_ibnr: ex.loss_ibnr || [0, 0, 0],
                lae_reserves_dcc: ex.lae_reserves_dcc || [0, 0, 0],
                lae_ibnr_dcc: ex.lae_ibnr_dcc || [0, 0, 0],
                lae_reserves_aoe: ex.lae_reserves_aoe || [0, 0, 0],
                lae_ibnr_aoe: ex.lae_ibnr_aoe || [0, 0, 0],
                ulae_ibnr: ex.ulae_ibnr || [0, 0, 0],
            };
            return {
                stateCode: ex.stateCode,
                data,
            };
        });
        results.sort((a, b) => {
            if (a.stateCode === 'TOTAL')
                return 1;
            if (b.stateCode === 'TOTAL')
                return -1;
            return a.stateCode.localeCompare(b.stateCode);
        });
        return results;
    }
    async updateSeederFile(stateCode, data) {
        const cleanState = stateCode.toUpperCase().trim();
        const itdWorkbooks = await this.workbookRepo.find({
            where: { source: 'ITD' },
            relations: { stateExhibits: true },
        });
        if (itdWorkbooks.length === 0) {
            return {
                success: false,
                message: `No active ITD workbook found in the database. Please upload an ITD Excel workbook first.`,
            };
        }
        for (const itdWorkbook of itdWorkbooks) {
            const fields = [
                'pw', 'pfw', 'pc', 'pfc', 'tax', 'lp', 'laep', 'ae_paid',
                'pe', 'pfe', 'uep', 'loss_reserves', 'loss_ibnr',
                'lae_reserves_dcc', 'lae_ibnr_dcc', 'lae_reserves_aoe', 'lae_ibnr_aoe', 'ulae_ibnr',
                'lu', 'laeu', 'aeu'
            ];
            const safeNumArr = (field) => {
                const val = data[field];
                if (Array.isArray(val) && val.length === 3) {
                    return val.map(v => Number(v) || 0);
                }
                return [0, 0, 0];
            };
            let exhibit = itdWorkbook.stateExhibits.find(e => e.stateCode === cleanState);
            if (!exhibit) {
                exhibit = this.stateExhibitRepo.create({
                    workbookId: itdWorkbook.id,
                    stateCode: cleanState,
                });
            }
            fields.forEach(f => {
                exhibit[f] = safeNumArr(f);
            });
            await this.stateExhibitRepo.save(exhibit);
            await this.recalculateTotalExhibitInDb(itdWorkbook.id);
        }
        return {
            success: true,
            message: `Database ITD workbook successfully updated for state ${cleanState}.`,
        };
    }
    async recalculateTotalExhibitInDb(workbookId) {
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
            'pe', 'pfe', 'uep', 'loss_reserves', 'loss_ibnr',
            'lae_reserves_dcc', 'lae_ibnr_dcc', 'lae_reserves_aoe', 'lae_ibnr_aoe', 'ulae_ibnr',
            'lu', 'laeu', 'aeu'
        ];
        fields.forEach((field) => {
            const sums = [0, 0, 0];
            nonTotalExhibits.forEach((ex) => {
                const arr = ex[field] || [];
                for (let i = 0; i < 3; i++) {
                    sums[i] += Number(arr[i] || 0);
                }
            });
            for (let i = 0; i < 3; i++) {
                sums[i] = Number(sums[i].toFixed(2));
            }
            totalExhibit[field] = sums;
        });
        await this.stateExhibitRepo.save(totalExhibit);
    }
};
exports.ItdSeederService = ItdSeederService;
exports.ItdSeederService = ItdSeederService = ItdSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workbook_entity_1.Workbook)),
    __param(1, (0, typeorm_1.InjectRepository)(state_exhibit_entity_1.StateExhibit)),
    __param(2, (0, typeorm_1.InjectRepository)(cash_settlement_entity_1.CashSettlement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ItdSeederService);
//# sourceMappingURL=itd-seeder.service.js.map