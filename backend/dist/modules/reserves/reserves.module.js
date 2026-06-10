"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservesModule = void 0;
const common_1 = require("@nestjs/common");
const loss_ibnr_service_1 = require("./services/loss-ibnr.service");
const lae_ibnr_service_1 = require("./services/lae-ibnr.service");
const ulae_ibnr_service_1 = require("./services/ulae-ibnr.service");
let ReservesModule = class ReservesModule {
};
exports.ReservesModule = ReservesModule;
exports.ReservesModule = ReservesModule = __decorate([
    (0, common_1.Module)({
        providers: [loss_ibnr_service_1.LossIbnrService, lae_ibnr_service_1.LaeIbnrService, ulae_ibnr_service_1.UlaeIbnrService],
        exports: [loss_ibnr_service_1.LossIbnrService, lae_ibnr_service_1.LaeIbnrService, ulae_ibnr_service_1.UlaeIbnrService],
    })
], ReservesModule);
//# sourceMappingURL=reserves.module.js.map