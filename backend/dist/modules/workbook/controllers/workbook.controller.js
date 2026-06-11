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
exports.WorkbookController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const workbook_service_1 = require("../services/workbook.service");
const update_exhibit_dto_1 = require("../dto/update-exhibit.dto");
const update_rates_dto_1 = require("../dto/update-rates.dto");
const update_cash_settlement_dto_1 = require("../dto/update-cash-settlement.dto");
const update_mappings_dto_1 = require("../dto/update-mappings.dto");
let WorkbookController = class WorkbookController {
    workbookService;
    constructor(workbookService) {
        this.workbookService = workbookService;
    }
    async findAll() {
        return this.workbookService.findAll();
    }
    async findPrograms() {
        return this.workbookService.findPrograms();
    }
    async createProgram(name, rates) {
        return this.workbookService.createProgram(name, rates);
    }
    async findOne(id) {
        return this.workbookService.findOne(id);
    }
    async delete(id) {
        await this.workbookService.delete(id);
    }
    async updateMappings(id, dto) {
        return this.workbookService.updateMappings(id, dto);
    }
    async updateExhibit(id, stateCode, dto) {
        return this.workbookService.updateExhibit(id, stateCode.toUpperCase(), dto);
    }
    async updateRates(id, dto) {
        return this.workbookService.updateRates(id, dto);
    }
    async updateCashSettlement(id, dto) {
        return this.workbookService.updateCashSettlement(id, dto);
    }
    async uploadFile(file, overwrite, program) {
        const forceOverwrite = overwrite === 'true';
        return this.workbookService.uploadWorkbook(file.buffer, file.originalname, forceOverwrite, program);
    }
    async generateITDExcel(file, program, res) {
        const buffer = await this.workbookService.generateITDExcel(file.buffer, program);
        const safeProgram = program ? program.replace(/\s+/g, '_') : 'Program';
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=ITD_Seeder_${safeProgram}_${file.originalname}`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
};
exports.WorkbookController = WorkbookController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('programs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "findPrograms", null);
__decorate([
    (0, common_1.Post)('programs'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('rates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "createProgram", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)(':id/mappings'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_mappings_dto_1.UpdateMappingsDto]),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "updateMappings", null);
__decorate([
    (0, common_1.Put)(':id/exhibits/:stateCode'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('stateCode')),
    __param(2, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, update_exhibit_dto_1.UpdateExhibitDto]),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "updateExhibit", null);
__decorate([
    (0, common_1.Put)(':id/rates'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_rates_dto_1.UpdateRatesDto]),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "updateRates", null);
__decorate([
    (0, common_1.Put)(':id/cash-settlement'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_cash_settlement_dto_1.UpdateCashSettlementDto]),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "updateCashSettlement", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('overwrite')),
    __param(2, (0, common_1.Body)('program')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('generate-itd'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('program')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WorkbookController.prototype, "generateITDExcel", null);
exports.WorkbookController = WorkbookController = __decorate([
    (0, common_1.Controller)('api/workbooks'),
    __metadata("design:paramtypes", [workbook_service_1.WorkbookService])
], WorkbookController);
//# sourceMappingURL=workbook.controller.js.map