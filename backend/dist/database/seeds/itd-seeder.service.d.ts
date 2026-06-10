import { Repository } from 'typeorm';
import { Workbook } from '../../modules/workbook/entities/workbook.entity';
import { StateExhibit } from '../../modules/workbook/entities/state-exhibit.entity';
import { CashSettlement } from '../../modules/workbook/entities/cash-settlement.entity';
export declare class ItdSeederService {
    private readonly workbookRepo;
    private readonly stateExhibitRepo;
    private readonly cashSettlementRepo;
    private readonly logger;
    constructor(workbookRepo: Repository<Workbook>, stateExhibitRepo: Repository<StateExhibit>, cashSettlementRepo: Repository<CashSettlement>);
    clearAllData(): Promise<{
        success: boolean;
        message: string;
    }>;
    checkItdSeeded(): Promise<{
        seeded: boolean;
        message: string;
    }>;
    seedItdData(): Promise<any[]>;
    getSeederFiles(): any[];
    updateSeederFile(stateCode: string, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    private recalculateTotalSeederFile;
    private recalculateTotalExhibitInDb;
}
