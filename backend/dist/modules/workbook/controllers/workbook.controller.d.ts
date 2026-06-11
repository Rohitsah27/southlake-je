import { WorkbookService } from '../services/workbook.service';
import { UpdateExhibitDto } from '../dto/update-exhibit.dto';
import { UpdateRatesDto } from '../dto/update-rates.dto';
import { UpdateCashSettlementDto } from '../dto/update-cash-settlement.dto';
import { UpdateMappingsDto } from '../dto/update-mappings.dto';
export declare class WorkbookController {
    private readonly workbookService;
    constructor(workbookService: WorkbookService);
    findAll(): Promise<import("../entities/workbook.entity").Workbook[]>;
    findPrograms(): Promise<import("../entities/program.entity").Program[]>;
    createProgram(name: string, rates: any): Promise<import("../entities/program.entity").Program>;
    findOne(id: number): Promise<import("../entities/workbook.entity").Workbook>;
    delete(id: number): Promise<void>;
    updateMappings(id: number, dto: UpdateMappingsDto): Promise<import("../entities/workbook.entity").Workbook>;
    updateExhibit(id: number, stateCode: string, dto: UpdateExhibitDto): Promise<import("../entities/state-exhibit.entity").StateExhibit>;
    updateRates(id: number, dto: UpdateRatesDto): Promise<import("../entities/workbook.entity").Workbook>;
    updateCashSettlement(id: number, dto: UpdateCashSettlementDto): Promise<import("../entities/cash-settlement.entity").CashSettlement>;
    uploadFile(file: Express.Multer.File, overwrite?: string, program?: string): Promise<any>;
    generateITDExcel(file: Express.Multer.File, program: string, res: any): Promise<void>;
}
