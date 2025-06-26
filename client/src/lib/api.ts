import { apiRequest } from './queryClient';

export interface DocumentUpload {
  title: string;
  fileType: 'pdf' | 'google_docs' | 'text';
  text?: string;
  sourceUrl?: string;
  file?: File;
}

export interface AnalysisSettings {
  boldKeyArguments: boolean;
  highlightStatistics: boolean;
  includeCitations: boolean;
}

export interface AnalysisRequest {
  prompt: string;
  settings: AnalysisSettings;
}

export async function uploadDocument(data: DocumentUpload) {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('fileType', data.fileType);
  
  if (data.file) {
    formData.append('file', data.file);
  }
  
  if (data.text) {
    formData.append('text', data.text);
  }
  
  if (data.sourceUrl) {
    formData.append('sourceUrl', data.sourceUrl);
  }

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }

  return response.json();
}

export async function analyzeDocument(documentId: number, data: AnalysisRequest) {
  const response = await apiRequest('POST', `/api/documents/${documentId}/analyze`, data);
  return response.json();
}

export async function getDocument(documentId: number) {
  const response = await apiRequest('GET', `/api/documents/${documentId}`);
  return response.json();
}

export async function getDocuments() {
  const response = await apiRequest('GET', '/api/documents');
  return response.json();
}
