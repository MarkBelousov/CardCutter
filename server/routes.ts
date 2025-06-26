import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage.js";
import { processDocument, extractTextFromPDF, extractTextFromGoogleDocs } from "./services/documentProcessor.js";
import { insertDocumentSchema, insertAnalysisSchema, insertDebateCardSchema } from "@shared/schema.js";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload document
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      const { title, fileType, sourceUrl } = req.body;
      let text = "";

      if (fileType === "pdf" && req.file) {
        try {
          text = await extractTextFromPDF(req.file.buffer);
        } catch (error) {
          return res.status(400).json({ 
            message: "PDF parsing not implemented. Please copy and paste your text content directly." 
          });
        }
      } else if (fileType === "google_docs" && sourceUrl) {
        try {
          text = await extractTextFromGoogleDocs(sourceUrl);
        } catch (error) {
          return res.status(400).json({ 
            message: "Google Docs integration not implemented. Please copy and paste your text content directly." 
          });
        }
      } else if (fileType === "text" && req.body.text) {
        text = req.body.text;
      } else {
        return res.status(400).json({ message: "Invalid file type or missing content" });
      }

      const documentData = insertDocumentSchema.parse({
        userId: 1, // For now, using default user
        title: title || "Untitled Document",
        originalText: text,
        fileType,
        sourceUrl: sourceUrl || null,
      });

      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Process document with AI
  app.post("/api/documents/:id/analyze", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { prompt, settings } = req.body;

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Create analysis record
      const analysisData = insertAnalysisSchema.parse({
        documentId,
        prompt,
        settings,
        status: "processing",
      });

      const analysis = await storage.createAnalysis(analysisData);

      try {
        // Process the document
        const result = await processDocument(document.originalText, prompt, settings);

        // Update document with processed text
        await storage.updateDocumentProcessedText(documentId, result.content);

        // Create debate cards
        for (const cardData of result.cards) {
          const card = insertDebateCardSchema.parse({
            documentId,
            title: cardData.title,
            content: cardData.content,
            relevanceScore: cardData.relevanceScore,
            category: cardData.category,
          });
          await storage.createDebateCard(card);
        }

        // Update analysis status
        await storage.updateAnalysisStatus(analysis.id, "completed");

        res.json({
          analysis,
          processedText: result.content,
          cards: result.cards,
          summary: result.summary,
        });

      } catch (processingError) {
        await storage.updateAnalysisStatus(analysis.id, "failed");
        throw processingError;
      }

    } catch (error) {
      console.error("Document analysis error:", error);
      res.status(500).json({ message: "Failed to analyze document: " + (error as Error).message });
    }
  });

  // Get document with cards
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const cards = await storage.getDebateCardsByDocumentId(documentId);
      
      res.json({
        document,
        cards,
      });
    } catch (error) {
      console.error("Get document error:", error);
      res.status(500).json({ message: "Failed to get document" });
    }
  });

  // Get all documents for user
  app.get("/api/documents", async (req, res) => {
    try {
      const userId = 1; // For now, using default user
      const documents = await storage.getDocumentsByUserId(userId);
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
