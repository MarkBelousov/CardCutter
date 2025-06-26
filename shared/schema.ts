import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  originalText: text("original_text").notNull(),
  processedText: text("processed_text"),
  fileType: text("file_type").notNull(), // 'pdf', 'google_docs'
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const debateCards = pgTable("debate_cards", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  relevanceScore: text("relevance_score"), // 'High', 'Medium', 'Low'
  category: text("category"), // 'Economic Impact', 'Policy Solutions', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  prompt: text("prompt").notNull(),
  settings: jsonb("settings"), // analysis settings like bold key arguments, etc.
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertDebateCardSchema = createInsertSchema(debateCards).omit({
  id: true,
  createdAt: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertDebateCard = z.infer<typeof insertDebateCardSchema>;
export type DebateCard = typeof debateCards.$inferSelect;

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
