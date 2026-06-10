"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkbookModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workbook_controller_1 = require("./controllers/workbook.controller");
const workbook_service_1 = require("./services/workbook.service");
const workbook_entity_1 = require("./entities/workbook.entity");
const state_exhibit_entity_1 = require("./entities/state-exhibit.entity");
const cash_settlement_entity_1 = require("./entities/cash-settlement.entity");
const excel_parser_service_1 = require("./services/excel-parser.service");
let WorkbookModule = class WorkbookModule {
};
exports.WorkbookModule = WorkbookModule;
exports.WorkbookModule = WorkbookModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([workbook_entity_1.Workbook, state_exhibit_entity_1.StateExhibit, cash_settlement_entity_1.CashSettlement])],
        controllers: [workbook_controller_1.WorkbookController],
        providers: [workbook_service_1.WorkbookService, excel_parser_service_1.ExcelParserService],
        exports: [workbook_service_1.WorkbookService, excel_parser_service_1.ExcelParserService, typeorm_1.TypeOrmModule],
    })
], WorkbookModule);
//# sourceMappingURL=workbook.module.js.map