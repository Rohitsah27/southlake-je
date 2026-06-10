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
exports.CashSettlement = void 0;
const typeorm_1 = require("typeorm");
const workbook_entity_1 = require("./workbook.entity");
let CashSettlement = class CashSettlement {
    id;
    workbookId;
    begBal;
    amtPaid;
    workbook;
};
exports.CashSettlement = CashSettlement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CashSettlement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CashSettlement.prototype, "workbookId", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashSettlement.prototype, "begBal", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CashSettlement.prototype, "amtPaid", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => workbook_entity_1.Workbook, (workbook) => workbook.cashSettlement, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'workbookId' }),
    __metadata("design:type", workbook_entity_1.Workbook)
], CashSettlement.prototype, "workbook", void 0);
exports.CashSettlement = CashSettlement = __decorate([
    (0, typeorm_1.Entity)('cash_settlements')
], CashSettlement);
//# sourceMappingURL=cash-settlement.entity.js.map