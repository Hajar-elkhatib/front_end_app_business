export interface KnowledgeDocument {
    id: string;
    title: string;
    content: string;
    sourceType: string;
    embeddingVector: string;
    createdAt: Date | string;
}

export type DocumentType =
    | 'PDF'
    | 'Word'
    | 'Text';

export type DocumentStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED';