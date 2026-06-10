"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://postgres:Rohitpk27@localhost:5432/insurance',
    autoLoadEntities: true,
    synchronize: true,
}));
//# sourceMappingURL=database.config.js.map