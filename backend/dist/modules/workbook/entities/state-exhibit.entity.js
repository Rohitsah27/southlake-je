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
exports.StateExhibit = void 0;
const typeorm_1 = require("typeorm");
const workbook_entity_1 = require("./workbook.entity");
let StateExhibit = class StateExhibit {
    id;
    workbookId;
    stateCode;
    pw;
    pfw;
    pc;
    pfc;
    tax;
    lp;
    laep;
    ae_paid;
    pe;
    pfe;
    uep;
    lu;
    laeu;
    aeu;
    loss_reserves;
    lae_reserves_dcc;
    lae_reserves_aoe;
    loss_ibnr;
    lae_ibnr_dcc;
    lae_ibnr_aoe;
    ulae_ibnr;
    workbook;
};
exports.StateExhibit = StateExhibit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StateExhibit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StateExhibit.prototype, "workbookId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StateExhibit.prototype, "stateCode", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "pw", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "pfw", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "pc", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "pfc", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "tax", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "lp", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "laep", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "ae_paid", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "pe", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "pfe", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "uep", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "lu", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "laeu", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "aeu", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "loss_reserves", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "lae_reserves_dcc", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "lae_reserves_aoe", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "loss_ibnr", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "lae_ibnr_dcc", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "lae_ibnr_aoe", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { array: true, default: [0, 0, 0] }),
    __metadata("design:type", Array)
], StateExhibit.prototype, "ulae_ibnr", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workbook_entity_1.Workbook, (workbook) => workbook.stateExhibits, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'workbookId' }),
    __metadata("design:type", workbook_entity_1.Workbook)
], StateExhibit.prototype, "workbook", void 0);
exports.StateExhibit = StateExhibit = __decorate([
    (0, typeorm_1.Entity)('state_exhibits')
], StateExhibit);
//# sourceMappingURL=state-exhibit.entity.js.map