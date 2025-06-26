import { users, documents, debateCards, analyses, type User, type InsertUser, type Document, type InsertDocument, type DebateCard, type InsertDebateCard, type Analysis, type InsertAnalysis } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  updateDocumentProcessedText(id: number, processedText: string): Promise<void>;

  // Debate card methods
  createDebateCard(card: InsertDebateCard): Promise<DebateCard>;
  getDebateCardsByDocumentId(documentId: number): Promise<DebateCard[]>;

  // Analysis methods
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  updateAnalysisStatus(id: number, status: string): Promise<void>;
  getAnalysesByDocumentId(documentId: number): Promise<Analysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private debateCards: Map<number, DebateCard>;
  private analyses: Map<number, Analysis>;
  private currentUserId: number;
  private currentDocumentId: number;
  private currentCardId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.debateCards = new Map();
    this.analyses = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentCardId = 1;
    this.currentAnalysisId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId,
    );
  }

  async updateDocumentProcessedText(id: number, processedText: string): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      this.documents.set(id, { ...document, processedText });
    }
  }

  async createDebateCard(insertCard: InsertDebateCard): Promise<DebateCard> {
    const id = this.currentCardId++;
    const card: DebateCard = {
      ...insertCard,
      id,
      createdAt: new Date(),
    };
    this.debateCards.set(id, card);
    return card;
  }

  async getDebateCardsByDocumentId(documentId: number): Promise<DebateCard[]> {
    return Array.from(this.debateCards.values()).filter(
      (card) => card.documentId === documentId,
    );
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentAnalysisId++;
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async updateAnalysisStatus(id: number, status: string): Promise<void> {
    const analysis = this.analyses.get(id);
    if (analysis) {
      this.analyses.set(id, { ...analysis, status });
    }
  }

  async getAnalysesByDocumentId(documentId: number): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).filter(
      (analysis) => analysis.documentId === documentId,
    );
  }
}

export const storage = new MemStorage();
