import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workbook } from '../../modules/workbook/entities/workbook.entity';
import { StateExhibit } from '../../modules/workbook/entities/state-exhibit.entity';
import { CashSettlement } from '../../modules/workbook/entities/cash-settlement.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ItdSeederService {
  private readonly logger = new Logger(ItdSeederService.name);

  constructor(
    @InjectRepository(Workbook)
    private readonly workbookRepo: Repository<Workbook>,
    @InjectRepository(StateExhibit)
    private readonly stateExhibitRepo: Repository<StateExhibit>,
    @InjectRepository(CashSettlement)
    private readonly cashSettlementRepo: Repository<CashSettlement>,
  ) {}

  async clearAllData(): Promise<{ success: boolean; message: string }> {
    this.logger.log('Clearing all database workbook data...');
    const deleteRes = await this.workbookRepo
      .createQueryBuilder()
      .delete()
      .execute();
    this.logger.log(`Clear complete. Affected rows: ${deleteRes.affected}`);
    return {
      success: true,
      message: `Database successfully cleared. Workbooks deleted: ${deleteRes.affected}`,
    };
  }

  async checkItdSeeded(): Promise<{ seeded: boolean; message: string }> {
    const itdWorkbook = await this.workbookRepo.findOne({
      where: { program: 'DPR APD', source: 'ITD' },
    });
    return {
      seeded: !!itdWorkbook,
      message: itdWorkbook ? 'ITD data has been seeded.' : 'ITD data has not been seeded yet.',
    };
  }

  async seedItdData(): Promise<any[]> {
    this.logger.log('Starting ITD only database seed operation from separate state files...');
    
    // Resolve states folder path
    const statesDir = path.join(process.cwd(), 'src/database/seeds/states');
    const workspaceDir = 'C:/Users/ASUS/Desktop/Treaty - 1/itd_states_seeder_data';
    
    // Recalculate TOTAL.json on disk first so it has correct summed values
    this.recalculateTotalSeederFile(statesDir, workspaceDir);

    // 1. Remove only existing ITD workbooks for this program to avoid conflicts
    const existingItd = await this.workbookRepo.find({ where: { program: 'DPR APD', source: 'ITD' } });
    if (existingItd.length > 0) {
      this.logger.log(`Removing ${existingItd.length} existing ITD workbook(s)...`);
      await this.workbookRepo.remove(existingItd);
    }
    if (!fs.existsSync(statesDir)) {
      throw new Error(`Seeder states directory not found at ${statesDir}. Please run extraction first.`);
    }

    const files = fs.readdirSync(statesDir).filter(f => f.endsWith('.json'));
    this.logger.log(`Found ${files.length} state JSON files: ${files.join(', ')}`);
    if (files.length === 0) {
      throw new Error(`No state JSON files found under ${statesDir}.`);
    }

    // 3. Create single Workbook entity for December 2025 representing the ITD values
    const program = 'DPR APD';
    const monthKey = '2025-12';
    const monthLabel = 'December 2025';
    const source = 'ITD';

    const rates = {
      qs: 100,
      cf: 5,
      comm: 29.0,
      bb: 0.40,
      ulae: 7.0,
      xol: 2.0,
      lr: 0.0,
      lossPick: 51.8,
      laeDcc: 0.0,
      laeAoe: 13.4,
      boardsCharge: 0.40,
      lossRatioCap: 2.0
    };

    const workbook = this.workbookRepo.create({
      program,
      monthKey,
      monthLabel,
      source,
      rates,
      mga: '2002',
      lob: '000212',
      lineDescSuffix: 'FUT Starlight T2 APD DRP',
      cc: '00',
      comp: '100',
      ext: '0000',
      sub: '',
    });

    const savedWb = await this.workbookRepo.save(workbook);
    this.logger.log(`Created ITD workbook with ID: ${savedWb.id}`);

    const exhibits = [];
    for (const file of files) {
      const filePath = path.join(statesDir, file);
      const exJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.logger.log(`Reading ${file}: stateCode=${exJson.stateCode}, pw=${JSON.stringify(exJson.pw)}`);

      const safeNumArr = (field: string): number[] => {
        const val = exJson[field];
        if (Array.isArray(val) && val.length === 3) {
          return val.map(v => Number(v) || 0);
        }
        return [0, 0, 0];
      };

      const ex = this.stateExhibitRepo.create({
        workbookId: savedWb.id,
        stateCode: exJson.stateCode,
        pw: safeNumArr('pw'),
        pfw: safeNumArr('pfw'),
        pc: safeNumArr('pc'),
        pfc: safeNumArr('pfc'),
        tax: safeNumArr('tax'),
        lp: safeNumArr('lp'),
        laep: safeNumArr('laep'),
        ae_paid: safeNumArr('ae_paid'),
        pe: safeNumArr('pe'),
        pfe: safeNumArr('pfe'),
        uep: safeNumArr('uep'),
        lu: safeNumArr('lu'),
        laeu: safeNumArr('laeu'),
        aeu: safeNumArr('aeu'),
        loss_reserves: safeNumArr('loss_reserves'),
        loss_ibnr: safeNumArr('loss_ibnr'),
        lae_reserves_dcc: safeNumArr('lae_reserves_dcc'),
        lae_ibnr_dcc: safeNumArr('lae_ibnr_dcc'),
        lae_reserves_aoe: safeNumArr('lae_reserves_aoe'),
        lae_ibnr_aoe: safeNumArr('lae_ibnr_aoe'),
        ulae_ibnr: safeNumArr('ulae_ibnr'),
      });

      exhibits.push(ex);
    }

    this.logger.log(`Saving ${exhibits.length} exhibits to database...`);
    const savedExhibits = await this.stateExhibitRepo.save(exhibits);
    this.logger.log(`Successfully saved ${savedExhibits.length} exhibits`);

    // Create Cash Settlement
    const cs = this.cashSettlementRepo.create({
      workbookId: savedWb.id,
      begBal: 0,
      amtPaid: 0,
    });
    await this.cashSettlementRepo.save(cs);

    // Verify data by re-fetching
    const verifyWb = await this.workbookRepo.findOne({
      where: { id: savedWb.id },
      relations: { stateExhibits: true },
    });
    this.logger.log(`Verification: ITD workbook has ${verifyWb?.stateExhibits?.length || 0} exhibits`);
    if (verifyWb?.stateExhibits && verifyWb.stateExhibits.length > 0) {
      const totalEx = verifyWb.stateExhibits.find(e => e.stateCode === 'TOTAL');
      if (totalEx) {
        this.logger.log(`TOTAL exhibit - pw: ${JSON.stringify(totalEx.pw)}, uep: ${JSON.stringify(totalEx.uep)}, lu: ${JSON.stringify(totalEx.lu)}`);
      }
    }

    return [{
      file: `${program} - ${monthKey}`,
      success: true,
      message: `Successfully seeded ITD workbook with ${savedExhibits.length} separate state JSON files.`
    }];
  }

  getSeederFiles(): any[] {
    const statesDir = path.join(process.cwd(), 'src/database/seeds/states');
    if (!fs.existsSync(statesDir)) {
      return [];
    }
    const files = fs.readdirSync(statesDir).filter(f => f.endsWith('.json'));
    const results = [];
    for (const file of files) {
      const stateCode = file.replace('.json', '');
      const filePath = path.join(statesDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        results.push({ stateCode, data });
      } catch (e) {
        // ignore malformed files
      }
    }
    // Sort states so TOTAL is at the end, others alphabetical
    results.sort((a, b) => {
      if (a.stateCode === 'TOTAL') return 1;
      if (b.stateCode === 'TOTAL') return -1;
      return a.stateCode.localeCompare(b.stateCode);
    });
    return results;
  }

  async updateSeederFile(stateCode: string, data: any): Promise<{ success: boolean; message: string }> {
    const cleanState = stateCode.toUpperCase().trim();
    
    // Save to backend seeds folder
    const backendDir = path.join(process.cwd(), 'src/database/seeds/states');
    const backendPath = path.join(backendDir, `${cleanState}.json`);
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }
    fs.writeFileSync(backendPath, JSON.stringify(data, null, 2));

    // Save to workspace root folder for visibility
    const workspaceDir = 'C:/Users/ASUS/Desktop/Treaty - 1/itd_states_seeder_data';
    if (fs.existsSync(workspaceDir)) {
      const workspacePath = path.join(workspaceDir, `${cleanState}.json`);
      fs.writeFileSync(workspacePath, JSON.stringify(data, null, 2));
    }

    // Auto recalculate TOTAL if the updated state is not TOTAL itself
    if (cleanState !== 'TOTAL') {
      this.recalculateTotalSeederFile(backendDir, workspaceDir);
    }

    // Update the ITD workbook in the database if it exists
    const itdWorkbook = await this.workbookRepo.findOne({
      where: { program: 'DPR APD', source: 'ITD' },
      relations: { stateExhibits: true },
    });

    if (itdWorkbook) {
      const fields = [
        'pw', 'pfw', 'pc', 'pfc', 'tax', 'lp', 'laep', 'ae_paid',
        'pe', 'pfe', 'uep', 'loss_reserves', 'loss_ibnr', 
        'lae_reserves_dcc', 'lae_ibnr_dcc', 'lae_reserves_aoe', 'lae_ibnr_aoe', 'ulae_ibnr',
        'lu', 'laeu', 'aeu'
      ];

      const safeNumArr = (field: string): number[] => {
        const val = data[field];
        if (Array.isArray(val) && val.length === 3) {
          return val.map(v => Number(v) || 0);
        }
        return [0, 0, 0];
      };

      let exhibit = itdWorkbook.stateExhibits.find(e => e.stateCode === cleanState);
      if (!exhibit) {
        exhibit = this.stateExhibitRepo.create({
          workbookId: itdWorkbook.id,
          stateCode: cleanState,
        });
      }

      fields.forEach(f => {
        (exhibit as any)[f] = safeNumArr(f);
      });

      await this.stateExhibitRepo.save(exhibit);

      // Recalculate TOTAL in database
      await this.recalculateTotalExhibitInDb(itdWorkbook.id);
    }

    return {
      success: true,
      message: `Seeder file for state ${cleanState} updated successfully, and changes are now live in the database workbook.`,
    };
  }

  private recalculateTotalSeederFile(backendDir: string, workspaceDir: string): void {
    if (!fs.existsSync(backendDir)) return;
    const files = fs.readdirSync(backendDir).filter(f => f.endsWith('.json') && f !== 'TOTAL.json');
    
    const fields = [
      'pw', 'pfw', 'pc', 'pfc', 'tax', 'lp', 'laep', 'ae_paid',
      'pe', 'pfe', 'uep', 'loss_reserves', 'loss_ibnr', 
      'lae_reserves_dcc', 'lae_ibnr_dcc', 'lae_reserves_aoe', 'lae_ibnr_aoe', 'ulae_ibnr',
      'lu', 'laeu', 'aeu'
    ];

    const totalData: any = {
      stateCode: 'TOTAL'
    };

    // Initialize all field arrays to [0, 0, 0]
    fields.forEach(f => {
      totalData[f] = [0, 0, 0];
    });

    for (const file of files) {
      try {
        const filePath = path.join(backendDir, file);
        const stateJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        fields.forEach(f => {
          const stateArr = stateJson[f] || [0, 0, 0];
          for (let i = 0; i < 3; i++) {
            totalData[f][i] += Number(stateArr[i] || 0);
          }
          // Round to 2 decimal places to avoid floating point errors
          for (let i = 0; i < 3; i++) {
            totalData[f][i] = Number(totalData[f][i].toFixed(2));
          }
        });
      } catch (e) {
        this.logger.error(`Error reading ${file} for total recalculation:`, e);
      }
    }

    // Write TOTAL.json to backend
    fs.writeFileSync(path.join(backendDir, 'TOTAL.json'), JSON.stringify(totalData, null, 2));

    // Write TOTAL.json to workspace root
    if (fs.existsSync(workspaceDir)) {
      fs.writeFileSync(path.join(workspaceDir, 'TOTAL.json'), JSON.stringify(totalData, null, 2));
    }
  }

  private async recalculateTotalExhibitInDb(workbookId: number): Promise<void> {
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
      'pe', 'pfe', 'uep', 'loss_reserves', 'loss_ibnr', 
      'lae_reserves_dcc', 'lae_ibnr_dcc', 'lae_reserves_aoe', 'lae_ibnr_aoe', 'ulae_ibnr',
      'lu', 'laeu', 'aeu'
    ];

    fields.forEach((field) => {
      const sums = [0, 0, 0];
      nonTotalExhibits.forEach((ex) => {
        const arr = (ex as any)[field] || [];
        for (let i = 0; i < 3; i++) {
          sums[i] += Number(arr[i] || 0);
        }
      });
      for (let i = 0; i < 3; i++) {
        sums[i] = Number(sums[i].toFixed(2));
      }
      (totalExhibit as any)[field] = sums;
    });

    await this.stateExhibitRepo.save(totalExhibit);
  }
}
