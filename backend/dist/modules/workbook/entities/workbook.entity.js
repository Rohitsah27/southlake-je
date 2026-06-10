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
exports.Workbook = void 0;
const typeorm_1 = require("typeorm");
const state_exhibit_entity_1 = require("./state-exhibit.entity");
const cash_settlement_entity_1 = require("./cash-settlement.entity");
let Workbook = class Workbook {
    id;
    program;
    monthKey;
    monthLabel;
    source;
    rates;
    mga;
    lob;
    lineDescSuffix;
    comp;
    cc;
    ext;
    sub;
    createdAt;
    stateExhibits;
    cashSettlement;
};
exports.Workbook = Workbook;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Workbook.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Workbook.prototype, "program", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Workbook.prototype, "monthKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Workbook.prototype, "monthLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'FUT' }),
    __metadata("design:type", String)
], Workbook.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Workbook.prototype, "rates", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '1201' }),
    __metadata("design:type", String)
], Workbook.prototype, "mga", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '000171' }),
    __metadata("design:type", String)
], Workbook.prototype, "lob", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], Workbook.prototype, "lineDescSuffix", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '100' }),
    __metadata("design:type", String)
], Workbook.prototype, "comp", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '000' }),
    __metadata("design:type", String)
], Workbook.prototype, "cc", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '0000' }),
    __metadata("design:type", String)
], Workbook.prototype, "ext", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], Workbook.prototype, "sub", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Workbook.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => state_exhibit_entity_1.StateExhibit, (exhibit) => exhibit.workbook, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Workbook.prototype, "stateExhibits", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => cash_settlement_entity_1.CashSettlement, (cs) => cs.workbook, { cascade: true, onDelete: 'CASCADE' }),
    __metadata("design:type", cash_settlement_entity_1.CashSettlement)
], Workbook.prototype, "cashSettlement", void 0);
exports.Workbook = Workbook = __decorate([
    (0, typeorm_1.Entity)('workbooks')
], Workbook);
//# sourceMappingURL=workbook.entity.js.map