import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:Rohitpk27@localhost:5432/insurance',
  autoLoadEntities: true,
  synchronize: true, // only for dev/testing, synchronizes db schemas with entities
}));
