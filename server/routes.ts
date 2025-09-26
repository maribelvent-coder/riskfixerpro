import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./openai-service";
import { 
  insertAssessmentSchema,
  insertFacilitySurveyQuestionSchema,
  insertAssessmentQuestionSchema,
  insertReportSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Assessment routes
  app.get("/api/assessments", async (req, res) => {
    try {
      const assessments = await storage.getAllAssessments();
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await storage.getAssessmentWithQuestions(id);
      
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res.status(500).json({ error: "Failed to fetch assessment" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const validatedData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(validatedData);
      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating assessment:", error);
      res.status(500).json({ error: "Failed to create assessment" });
    }
  });

  app.put("/api/assessments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updated = await storage.updateAssessment(id, updateData);
      
      if (!updated) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating assessment:", error);
      res.status(500).json({ error: "Failed to update assessment" });
    }
  });

  app.delete("/api/assessments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAssessment(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ error: "Failed to delete assessment" });
    }
  });

  // Facility Survey routes
  app.get("/api/assessments/:id/facility-survey", async (req, res) => {
    try {
      const { id } = req.params;
      const questions = await storage.getFacilitySurveyQuestions(id);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching facility survey:", error);
      res.status(500).json({ error: "Failed to fetch facility survey" });
    }
  });

  app.post("/api/assessments/:id/facility-survey", async (req, res) => {
    try {
      const { id } = req.params;
      const { questions } = req.body;
      
      if (!Array.isArray(questions)) {
        return res.status(400).json({ error: "Questions must be an array" });
      }

      // Validate each question
      const validatedQuestions = questions.map(q => 
        insertFacilitySurveyQuestionSchema.parse({ ...q, assessmentId: id })
      );
      
      const result = await storage.bulkUpsertFacilityQuestions(id, validatedQuestions);
      
      // Update assessment status to facility-survey when facility survey is saved
      const completedQuestions = result.filter(q => q.response !== null && q.response !== undefined).length;
      const progress = (completedQuestions / result.length) * 100;
      
      if (progress >= 80) {
        await storage.updateAssessment(id, { 
          status: "facility-survey",
          facilitySurveyCompleted: true,
          facilitySurveyCompletedAt: new Date()
        });
      }
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid facility survey data", details: error.errors });
      }
      console.error("Error saving facility survey:", error);
      res.status(500).json({ error: "Failed to save facility survey" });
    }
  });

  // Assessment Questions routes
  app.get("/api/assessments/:id/questions", async (req, res) => {
    try {
      const { id } = req.params;
      const questions = await storage.getAssessmentQuestions(id);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.post("/api/assessments/:id/questions/bulk", async (req, res) => {
    try {
      const { id } = req.params;
      const { questions } = req.body;
      
      if (!Array.isArray(questions)) {
        return res.status(400).json({ error: "Questions must be an array" });
      }

      // Validate each question
      const validatedQuestions = questions.map(q => 
        insertAssessmentQuestionSchema.parse({ ...q, assessmentId: id })
      );
      
      const result = await storage.bulkUpsertQuestions(id, validatedQuestions);
      
      // Update assessment status to risk-assessment when ASIS questions are saved
      await storage.updateAssessment(id, { 
        status: "risk-assessment",
        riskAssessmentCompleted: true,
        riskAssessmentCompletedAt: new Date()
      });
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid question data", details: error.errors });
      }
      console.error("Error saving questions:", error);
      res.status(500).json({ error: "Failed to save questions" });
    }
  });

  // AI Risk Analysis routes
  app.post("/api/assessments/:id/analyze", async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await storage.getAssessmentWithQuestions(id);
      
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      if (!assessment.questions || assessment.questions.length === 0) {
        return res.status(400).json({ error: "Assessment has no questions to analyze" });
      }

      // Generate AI analysis
      const analysis = await openaiService.analyzeSecurityRisks(assessment);
      
      // Save risk insights to storage
      const savedInsights = await storage.bulkCreateRiskInsights(analysis.insights);
      
      // Calculate risk level based on insights
      const criticalCount = savedInsights.filter(i => i.severity === "critical").length;
      const highCount = savedInsights.filter(i => i.severity === "high").length;
      
      let riskLevel = "low";
      if (criticalCount > 0) riskLevel = "critical";
      else if (highCount > 2) riskLevel = "high";
      else if (highCount > 0 || savedInsights.filter(i => i.severity === "medium").length > 3) riskLevel = "medium";
      
      // Update assessment with risk level and completed status
      await storage.updateAssessment(id, { 
        riskLevel,
        status: "completed",
        completedAt: new Date()
      });

      res.json({
        overallRiskScore: analysis.overallRiskScore,
        riskLevel,
        insights: savedInsights,
        executiveSummary: analysis.executiveSummary
      });
    } catch (error) {
      console.error("Error analyzing assessment:", error);
      res.status(500).json({ error: "Failed to analyze assessment" });
    }
  });

  app.get("/api/assessments/:id/insights", async (req, res) => {
    try {
      const { id } = req.params;
      const insights = await storage.getRiskInsights(id);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // Reports routes
  app.get("/api/assessments/:id/reports", async (req, res) => {
    try {
      const { id } = req.params;
      const reports = await storage.getReports(id);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/assessments/:id/reports", async (req, res) => {
    try {
      const { id } = req.params;
      const { type, title, format } = req.body;
      
      if (!type || !title || !format) {
        return res.status(400).json({ error: "Type, title, and format are required" });
      }

      const assessment = await storage.getAssessmentWithQuestions(id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Create report record
      const reportData = insertReportSchema.parse({
        assessmentId: id,
        type,
        title,
        format,
        status: "generating"
      });

      const report = await storage.createReport(reportData);

      // Generate report content asynchronously
      try {
        const content = await openaiService.generateReportContent(assessment, type);
        
        // Update report with generated content
        await storage.updateReport(report.id, {
          status: "ready",
          generatedAt: new Date(),
          filePath: `/reports/${report.id}.${format}`,
          fileSize: `${Math.round(content.length / 1024)}KB`
        });

        const updatedReport = await storage.getReport(report.id);
        res.status(201).json(updatedReport);
      } catch (error) {
        await storage.updateReport(report.id, { status: "error" });
        throw error;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid report data", details: error.errors });
      }
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.get("/api/reports/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (report.status !== "ready") {
        return res.status(400).json({ error: "Report is not ready for download" });
      }

      // In a real implementation, you would serve the actual file
      // For now, return report metadata
      res.json({
        id: report.id,
        title: report.title,
        format: report.format,
        downloadUrl: `/api/reports/${id}/download`,
        message: "Report download would be available here"
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      res.status(500).json({ error: "Failed to download report" });
    }
  });

  // Statistics/Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const assessments = await storage.getAllAssessments();
      
      const stats = {
        totalAssessments: assessments.length,
        activeAssessments: assessments.filter(a => a.status === "in-progress").length,
        completedThisMonth: assessments.filter(a => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return a.status === "completed" && 
                 a.completedAt && 
                 new Date(a.completedAt) > monthAgo;
        }).length,
        averageRiskScore: assessments.length > 0 ? 
          assessments.reduce((sum, a) => {
            const score = a.riskLevel === "critical" ? 9 : 
                         a.riskLevel === "high" ? 7 :
                         a.riskLevel === "medium" ? 5 : 3;
            return sum + score;
          }, 0) / assessments.length : 0,
        riskDistribution: {
          low: assessments.filter(a => a.riskLevel === "low").length,
          medium: assessments.filter(a => a.riskLevel === "medium").length,
          high: assessments.filter(a => a.riskLevel === "high").length,
          critical: assessments.filter(a => a.riskLevel === "critical").length
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
