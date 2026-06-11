const API_BASE = 'http://localhost:3000/api';

export interface Workbook {
  id: number;
  program: string;
  monthKey: string;
  monthLabel: string;
  source: string;
  rates: any;
  mga: string;
  lob: string;
  lineDescSuffix: string;
  comp: string;
  cc: string;
  ext: string;
  sub: string;
  createdAt: string;
  stateExhibits?: StateExhibit[];
  cashSettlement?: CashSettlement;
}

export interface StateExhibit {
  id: number;
  workbookId: number;
  stateCode: string;
  pw: number[];
  pfw: number[];
  pc: number[];
  pfc: number[];
  tax: number[];
  lp: number[];
  laep: number[];
  ae_paid: number[];
  pe: number[];
  pfe: number[];
  uep: number[];
  lu: number[];
  laeu: number[];
  aeu: number[];
  loss_reserves: number[];
  loss_ibnr: number[];
  lae_reserves_dcc: number[];
  lae_ibnr_dcc: number[];
  lae_reserves_aoe: number[];
  lae_ibnr_aoe: number[];
  ulae_ibnr: number[];
}

export interface CashSettlement {
  id: number;
  workbookId: number;
  begBal: number;
  amtPaid: number;
}

export const api = {
  async getWorkbooks(): Promise<Workbook[]> {
    const res = await fetch(`${API_BASE}/workbooks`);
    if (!res.ok) throw new Error('Failed to load workbooks');
    return res.json();
  },

  async getPrograms(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/workbooks/programs`);
    if (!res.ok) throw new Error('Failed to load programs');
    return res.json();
  },

  async createProgram(name: string, rates: any): Promise<any> {
    const res = await fetch(`${API_BASE}/workbooks/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rates }),
    });
    if (!res.ok) throw new Error('Failed to create program');
    return res.json();
  },

  async getWorkbook(id: number): Promise<Workbook> {
    const res = await fetch(`${API_BASE}/workbooks/${id}`);
    if (!res.ok) throw new Error(`Failed to load workbook ${id}`);
    return res.json();
  },

  async deleteWorkbook(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/workbooks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete workbook ${id}`);
  },

  async uploadWorkbook(file: File, overwrite: boolean = false, program?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (overwrite) {
      formData.append('overwrite', 'true');
    }
    if (program) {
      formData.append('program', program);
    }
    const res = await fetch(`${API_BASE}/workbooks/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: 'Failed to upload workbook' }));
      const error = new Error(errorBody.message || 'Failed to upload workbook');
      (error as any).status = res.status;
      throw error;
    }
    return res.json();
  },

  async generateITDExcel(file: File, program?: string): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    if (program) {
      formData.append('program', program);
    }
    const res = await fetch(`${API_BASE}/workbooks/generate-itd`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('Failed to generate ITD Excel from Starlight file');
    }
    return res.blob();
  },

  async updateExhibit(workbookId: number, stateCode: string, data: Partial<StateExhibit>): Promise<StateExhibit> {
    const res = await fetch(`${API_BASE}/workbooks/${workbookId}/exhibits/${stateCode}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update exhibit ${stateCode}`);
    return res.json();
  },

  async updateRates(workbookId: number, data: any): Promise<Workbook> {
    const res = await fetch(`${API_BASE}/workbooks/${workbookId}/rates`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update rates for workbook ${workbookId}`);
    return res.json();
  },

  async updateCashSettlement(workbookId: number, data: { begBal?: number; amtPaid?: number }): Promise<CashSettlement> {
    const res = await fetch(`${API_BASE}/workbooks/${workbookId}/cash-settlement`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update cash settlement for workbook ${workbookId}`);
    return res.json();
  },

  async getReinsuranceStatement(id: number, stateCode: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/workbooks/${id}/reinsurance-statement/${stateCode}`);
    if (!res.ok) throw new Error('Failed to load reinsurance statement');
    return res.json();
  },

  async getGLJournalEntries(id: number, stateCode: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/workbooks/${id}/gl-journal-entries/${stateCode}`);
    if (!res.ok) throw new Error('Failed to load GL journal entries');
    return res.json();
  },

  async getCashSettlementCalculations(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/workbooks/${id}/cash-settlement-calculations`);
    if (!res.ok) throw new Error('Failed to load cash settlement calculations');
    return res.json();
  },

  async updateMappings(id: number, data: any): Promise<Workbook> {
    const res = await fetch(`${API_BASE}/workbooks/${id}/mappings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update GL mappings');
    return res.json();
  },

  async clearDatabase(): Promise<any> {
    const res = await fetch(`${API_BASE}/database/clear`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to clear database');
    return res.json();
  },

  async seedDatabase(): Promise<any> {
    const res = await fetch(`${API_BASE}/database/seed`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to seed database');
    return res.json();
  },

  async getSeederFiles(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/database/seeder-files`);
    if (!res.ok) throw new Error('Failed to fetch seeder files');
    return res.json();
  },

  async updateSeederFile(stateCode: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/database/seeder-files/${stateCode}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update seeder file for ${stateCode}`);
    return res.json();
  },

  async checkItdSeeded(): Promise<{ seeded: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/database/check-itd-seeded`);
    if (!res.ok) throw new Error('Failed to check ITD seed status');
    return res.json();
  },
};

