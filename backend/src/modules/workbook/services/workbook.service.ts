import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workbook } from '../entities/workbook.entity';
import { StateExhibit } from '../entities/state-exhibit.entity';
import { CashSettlement } from '../entities/cash-settlement.entity';
import { UpdateExhibitDto } from '../dto/update-exhibit.dto';
import { UpdateRatesDto } from '../dto/update-rates.dto';
import { UpdateCashSettlementDto } from '../dto/update-cash-settlement.dto';
import { ExcelParserService } from './excel-parser.service';

@Injectable()
export class WorkbookService {
  constructor(
    @InjectRepository(Workbook)
    private readonly workbookRepo: Repository<Workbook>,
    @InjectRepository(StateExhibit)
    private readonly stateExhibitRepo: Repository<StateExhibit>,
    @InjectRepository(CashSettlement)
    private readonly cashSettlementRepo: Repository<CashSettlement>,

    private readonly excelParserService: ExcelParserService,
  ) {}

  async findAll(): Promise<Workbook[]> {
    return this.workbookRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Workbook> {
    const workbook = await this.workbookRepo.findOne({
      where: { id },
      relations: { stateExhibits: true, cashSettlement: true },
    });
    if (!workbook) {
      throw new NotFoundException(`Workbook with ID ${id} not found`);
    }
    if (workbook.stateExhibits) {
      workbook.stateExhibits.sort((a, b) => {
        if (a.stateCode === 'TOTAL') return -1;
        if (b.stateCode === 'TOTAL') return 1;
        return a.stateCode.localeCompare(b.stateCode);
      });
    }
    return workbook;
  }

  async delete(id: number): Promise<void> {
    const workbook = await this.findOne(id);
    await this.workbookRepo.remove(workbook);
  }

  async uploadWorkbook(fileBuffer: Buffer, filename: string, forceOverwrite: boolean = false): Promise<any> {
    return this.excelParserService.parseWorkbook(fileBuffer, filename, forceOverwrite);
  }

  async generateITDExcel(fileBuffer: Buffer): Promise<Buffer> {
    return this.excelParserService.generateITDWorkbookFromStarlight(fileBuffer);
  }

  async updateMappings(workbookId: number, dto: any): Promise<Workbook> {
    const workbook = await this.findOne(workbookId);
    if (dto.mga !== undefined) workbook.mga = dto.mga;
    if (dto.lob !== undefined) workbook.lob = dto.lob;
    if (dto.lineDescSuffix !== undefined) workbook.lineDescSuffix = dto.lineDescSuffix;
    if (dto.comp !== undefined) workbook.comp = dto.comp;
    if (dto.cc !== undefined) workbook.cc = dto.cc;
    if (dto.ext !== undefined) workbook.ext = dto.ext;
    if (dto.sub !== undefined) workbook.sub = dto.sub;
    return this.workbookRepo.save(workbook);
  }

  async updateExhibit(workbookId: number, stateCode: string, dto: UpdateExhibitDto): Promise<StateExhibit> {
    const workbook = await this.findOne(workbookId);
    const exhibit = workbook.stateExhibits.find((e) => e.stateCode === stateCode);
    if (!exhibit) {
      throw new NotFoundException(`State exhibit ${stateCode} not found in workbook ${workbookId}`);
    }

    Object.keys(dto).forEach((key) => {
      if ((dto as any)[key] !== undefined) {
        (exhibit as any)[key] = (dto as any)[key];
      }
    });

    const savedExhibit = await this.stateExhibitRepo.save(exhibit);
    await this.recalculateTotalExhibit(workbookId);
    return savedExhibit;
  }

  async updateRates(workbookId: number, dto: UpdateRatesDto): Promise<Workbook> {
    const workbook = await this.findOne(workbookId);
    workbook.rates = {
      ...workbook.rates,
      ...dto,
    };
    return this.workbookRepo.save(workbook);
  }

  async updateCashSettlement(workbookId: number, dto: UpdateCashSettlementDto): Promise<CashSettlement> {
    const workbook = await this.findOne(workbookId);
    if (!workbook.cashSettlement) {
      workbook.cashSettlement = this.cashSettlementRepo.create({
        workbookId,
        begBal: dto.begBal ?? 0,
        amtPaid: dto.amtPaid ?? 0,
      });
    } else {
      if (dto.begBal !== undefined) workbook.cashSettlement.begBal = dto.begBal;
      if (dto.amtPaid !== undefined) workbook.cashSettlement.amtPaid = dto.amtPaid;
    }
    return this.cashSettlementRepo.save(workbook.cashSettlement);
  }

  async findPreviousWorkbook(program: string, monthKey: string, source: string): Promise<Workbook | null> {
    return this.workbookRepo.findOne({
      where: { program, monthKey, source },
      relations: { stateExhibits: true },
    });
  }

  async findPreviousWorkbookFor(workbook: Workbook): Promise<Workbook | null> {
    // 1. If it's January (monthKey ends with '-01'), look for ITD source workbook for the same program
    if (workbook.monthKey.endsWith('-01')) {
      const itdWb = await this.workbookRepo.findOne({
        where: { program: workbook.program, source: 'ITD' },
        relations: { stateExhibits: true },
        order: { createdAt: 'DESC' },
      });
      if (itdWb) return itdWb;
    }

    // 2. Otherwise, find workbook of the same program, same source, for the previous month key
    const prevMonthKey = this.getPreviousMonthKey(workbook.monthKey);
    let prevWb = await this.workbookRepo.findOne({
      where: { program: workbook.program, monthKey: prevMonthKey, source: workbook.source },
      relations: { stateExhibits: true },
    });
    if (prevWb) return prevWb;

    // 3. Fallback: try to find any source workbook for the previous month key
    prevWb = await this.workbookRepo.findOne({
      where: { program: workbook.program, monthKey: prevMonthKey },
      relations: { stateExhibits: true },
      order: { createdAt: 'DESC' },
    });
    if (prevWb) return prevWb;

    // 4. Fallback 2: if it's not January, but we are a FUT/Starlight workbook and have no other previous workbook,
    // default to the program's ITD workbook as the ultimate baseline
    if (workbook.source !== 'ITD') {
      const itdWb = await this.workbookRepo.findOne({
        where: { program: workbook.program, source: 'ITD' },
        relations: { stateExhibits: true },
        order: { createdAt: 'DESC' },
      });
      if (itdWb) return itdWb;
    }

    return null;
  }

  private getPreviousMonthKey(monthKey: string): string {
    const parts = monthKey.split('-');
    let year = parseInt(parts[0]);
    let month = parseInt(parts[1]);
    month--;
    if (month === 0) {
      month = 12;
      year--;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  private async recalculateTotalExhibit(workbookId: number): Promise<void> {
    const allExhibits = await this.stateExhibitRepo.find({ where: { workbookId } });
    const nonTotalExhibits = allExhibits.filter((e) => e.stateCode !== 'TOTAL');
    let totalExhibit = allExhibits.find((e) => e.stateCode === 'TOTAL');

    if (!totalExhibit) {
      totalExhibit = this.stateExhibitRepo.create({
        workbookId,
        stateCode: 'TOTAL',
      });
    }

    const fields = [
      'pw', 'pfw', 'pc', 'pfc', 'tax', 'lp', 'laep', 'ae_paid',
      'pe', 'pfe', 'uep', 'lu', 'laeu', 'aeu',
      'loss_reserves', 'loss_ibnr', 'lae_reserves_dcc', 'lae_ibnr_dcc',
      'lae_reserves_aoe', 'lae_ibnr_aoe', 'ulae_ibnr'
    ];

    fields.forEach((field) => {
      const sums = [0, 0, 0];
      nonTotalExhibits.forEach((ex) => {
        const arr = (ex as any)[field] || [];
        for (let i = 0; i < 3; i++) {
          sums[i] += Number(arr[i] || 0);
        }
      });
      (totalExhibit as any)[field] = sums;
    });

    await this.stateExhibitRepo.save(totalExhibit);
  }
}
