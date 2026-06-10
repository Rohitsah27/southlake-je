import { ItdSeederService } from './seeds/itd-seeder.service';
export declare class DatabaseController {
    private readonly itdSeederService;
    constructor(itdSeederService: ItdSeederService);
    clearDatabase(): Promise<{
        success: boolean;
        message: string;
    }>;
    seedDatabase(): Promise<{
        success: boolean;
        message: string;
        results: any[];
    }>;
    checkItdSeeded(): Promise<{
        seeded: boolean;
        message: string;
    }>;
    getSeederFiles(): any[];
    updateSeederFile(stateCode: string, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
