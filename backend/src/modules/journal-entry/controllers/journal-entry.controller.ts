import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { JournalEntryService } from '../services/journal-entry.service';

@Controller('api/workbooks')
export class JournalEntryController {
  constructor(private readonly journalEntryService: JournalEntryService) {}

  @Get(':id/gl-journal-entries/:stateCode')
  async getGLJournalEntries(
    @Param('id', ParseIntPipe) id: number,
    @Param('stateCode') stateCode: string,
  ) {
    return this.journalEntryService.getGLJournalEntries(id, stateCode.toUpperCase());
  }
}
