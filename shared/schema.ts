import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  location: text("location").notNull(),
  assessor: text("assessor").notNull(),
  status: text("status").notNull().default("draft"), // draft, in-progress, completed, reviewed
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
  riskLevel: text("risk_level"), // low, medium, high, critical
});

export const assessmentQuestions = pgTable("assessment_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  questionId: text("question_id").notNull(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  type: text("type").notNull(), // yes-no, score, text
  weight: integer("weight").notNull(),
  response: jsonb("response"), // boolean | number | string
  notes: text("notes"),
  evidence: text("evidence").array(), // file paths/urls
});

export const riskInsights = pgTable("risk_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  category: text("category").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation").notNull(),
  impact: integer("impact").notNull(), // 1-10
  probability: integer("probability").notNull(), // 1-10
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  type: text("type").notNull(), // exec-summary, detailed-technical, compliance-report
  title: text("title").notNull(),
  format: text("format").notNull(), // pdf, docx, html
  status: text("status").notNull().default("pending"), // pending, generating, ready, error
  filePath: text("file_path"),
  fileSize: text("file_size"),
  createdAt: timestamp("created_at").default(sql`now()`),
  generatedAt: timestamp("generated_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertAssessmentQuestionSchema = createInsertSchema(assessmentQuestions).omit({
  id: true,
});

export const insertRiskInsightSchema = createInsertSchema(riskInsights).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  generatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type InsertAssessmentQuestion = z.infer<typeof insertAssessmentQuestionSchema>;

export type RiskInsight = typeof riskInsights.$inferSelect;
export type InsertRiskInsight = z.infer<typeof insertRiskInsightSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Assessment with related data
export type AssessmentWithQuestions = Assessment & {
  questions: AssessmentQuestion[];
  riskInsights?: RiskInsight[];
  reports?: Report[];
};
