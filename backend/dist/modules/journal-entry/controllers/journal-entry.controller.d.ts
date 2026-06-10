import { JournalEntryService } from '../services/journal-entry.service';
export declare class JournalEntryController {
    private readonly journalEntryService;
    constructor(journalEntryService: JournalEntryService);
    getGLJournalEntries(id: number, stateCode: string): Promise<any[]>;
}
