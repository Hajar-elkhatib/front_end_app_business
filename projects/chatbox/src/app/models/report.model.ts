export interface Report {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  reportType: string;
  content: string;
  pdfUrl?: string;
  generatedBy: string;
  modelVersion?: string;
  createdAt: Date | string;
}

export type ReportType = 'Financial' | 'Technical' | 'Market' | 'General' | string;
export type ReportStatus = 'Draft' | 'Published' | 'Archived' | string;
