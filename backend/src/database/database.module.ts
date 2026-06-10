import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkbookModule } from '../modules/workbook/workbook.module';
import { DatabaseController } from './database.controller';
import { ItdSeederService } from './seeds/itd-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('database.synchronize'),
      }),
    }),
    WorkbookModule,
  ],
  controllers: [DatabaseController],
  providers: [ItdSeederService],
  exports: [ItdSeederService],
})
export class DatabaseModule {}

