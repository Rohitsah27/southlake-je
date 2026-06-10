"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalEntryModule = void 0;
const common_1 = require("@nestjs/common");
const journal_entry_controller_1 = require("./controllers/journal-entry.controller");
const journal_entry_service_1 = require("./services/journal-entry.service");
const workbook_module_1 = require("../workbook/workbook.module");
const reports_module_1 = require("../reports/reports.module");
let JournalEntryModule = class JournalEntryModule {
};
exports.JournalEntryModule = JournalEntryModule;
exports.JournalEntryModule = JournalEntryModule = __decorate([
    (0, common_1.Module)({
        imports: [workbook_module_1.WorkbookModule, reports_module_1.ReportsModule],
        controllers: [journal_entry_controller_1.JournalEntryController],
        providers: [journal_entry_service_1.JournalEntryService],
        exports: [journal_entry_service_1.JournalEntryService],
    })
], JournalEntryModule);
//# sourceMappingURL=journal-entry.module.js.map