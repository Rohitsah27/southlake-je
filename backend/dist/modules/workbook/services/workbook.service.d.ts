import { Repository } from 'typeorm';
import { Workbook } from '../entities/workbook.entity';
import { StateExhibit } from '../entities/state-exhibit.entity';
import { CashSettlement } from '../entities/cash-settlement.entity';
import { UpdateExhibitDto } from '../dto/update-exhibit.dto';
import { UpdateRatesDto } from '../dto/update-rates.dto';
import { UpdateCashSettlementDto } from '../dto/update-cash-settlement.dto';
import { ExcelParserService } from './excel-parser.service';
export declare class WorkbookService {
    private readonly workbookRepo;
    private readonly stateExhibitRepo;
    private readonly cashSettlementRepo;
    private readonly excelParserService;
    constructor(workbookRepo: Repository<Workbook>, stateExhibitRepo: Repository<StateExhibit>, cashSettlementRepo: Repository<CashSettlement>, excelParserService: ExcelParserService);
    findAll(): Promise<Workbook[]>;
    findOne(id: number): Promise<Workbook>;
    delete(id: number): Promise<void>;
    uploadWorkbook(fileBuffer: Buffer, filename: string, forceOverwrite?: boolean): Promise<any>;
    generateITDExcel(fileBuffer: Buffer): Promise<Buffer>;
    updateMappings(workbookId: number, dto: any): Promise<Workbook>;
    updateExhibit(workbookId: number, stateCode: string, dto: UpdateExhibitDto): Promise<StateExhibit>;
    updateRates(workbookId: number, dto: UpdateRatesDto): Promise<Workbook>;
    updateCashSettlement(workbookId: number, dto: UpdateCashSettlementDto): Promise<CashSettlement>;
    findPreviousWorkbook(program: string, monthKey: string, source: string): Promise<Workbook | null>;
    findPreviousWorkbookFor(workbook: Workbook): Promise<Workbook | null>;
    private getPreviousMonthKey;
    private recalculateTotalExhibit;
}
