import OpenAI from "openai";
import type { AssessmentWithQuestions, InsertRiskInsight } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RiskAnalysisResult {
  overallRiskScore: number;
  insights: InsertRiskInsight[];
  executiveSummary: string;
}

export class OpenAIService {
  async analyzeSecurityRisks(assessment: AssessmentWithQuestions): Promise<RiskAnalysisResult> {
    try {
      const assessmentData = this.prepareAssessmentData(assessment);
      
      const prompt = `You are a senior physical security consultant. Analyze the following security assessment data and provide comprehensive risk insights.

Assessment Details:
- Facility: ${assessment.title}
- Location: ${assessment.location}
- Assessor: ${assessment.assessor}

Assessment Questions and Responses:
${assessmentData}

Please analyze this data and respond with a JSON object containing:
1. overallRiskScore: A number from 1-100 representing the overall security risk level
2. insights: An array of risk insights, each containing:
   - category: The security category (e.g., "Access Control", "Perimeter Security", "Physical Barriers")
   - severity: "low", "medium", "high", or "critical"
   - title: Brief title of the risk finding
   - description: Detailed explanation of the security concern
   - recommendation: Specific actionable recommendation to address the risk
   - impact: Number 1-10 representing potential impact if exploited
   - probability: Number 1-10 representing likelihood of exploitation
3. executiveSummary: A brief 2-3 sentence executive summary of the key findings

Focus on identifying genuine security vulnerabilities, gaps in protection, and actionable recommendations based on industry best practices.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert physical security consultant with 20+ years of experience. Provide thorough, professional security risk analysis based on assessment data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Validate and format the response
      const insights: InsertRiskInsight[] = (result.insights || []).map((insight: any) => ({
        assessmentId: assessment.id,
        category: insight.category || "General",
        severity: this.validateSeverity(insight.severity),
        title: insight.title || "Security Finding",
        description: insight.description || "No description provided",
        recommendation: insight.recommendation || "Review and assess",
        impact: Math.max(1, Math.min(10, insight.impact || 5)),
        probability: Math.max(1, Math.min(10, insight.probability || 5))
      }));

      return {
        overallRiskScore: Math.max(1, Math.min(100, result.overallRiskScore || 50)),
        insights,
        executiveSummary: result.executiveSummary || "Security assessment analysis completed."
      };

    } catch (error) {
      console.error("Error analyzing security risks:", error);
      throw new Error("Failed to generate AI risk analysis");
    }
  }

  async generateReportContent(assessment: AssessmentWithQuestions, reportType: string): Promise<string> {
    try {
      const assessmentData = this.prepareAssessmentData(assessment);
      const riskInsights = assessment.riskInsights || [];

      let prompt = "";
      
      if (reportType === "exec-summary") {
        prompt = `Create an executive summary report for this physical security assessment. Include:
        - Executive overview (2-3 paragraphs)
        - Key risk findings
        - Critical recommendations
        - Risk score summary
        
        Keep it concise and suitable for senior management.`;
      } else if (reportType === "detailed-technical") {
        prompt = `Create a comprehensive technical security assessment report including:
        - Methodology and scope
        - Detailed findings by category
        - Risk analysis with impact and probability
        - Specific technical recommendations
        - Implementation priorities
        
        Make it thorough and technical for security professionals.`;
      } else {
        prompt = `Create a compliance-focused security report including:
        - Regulatory compliance status
        - Gap analysis
        - Remediation requirements
        - Action plan with timelines`;
      }

      const fullPrompt = `${prompt}

Assessment Data:
Facility: ${assessment.title}
Location: ${assessment.location}
Assessor: ${assessment.assessor}
Status: ${assessment.status}

Questions and Responses:
${assessmentData}

Risk Insights:
${riskInsights.map(insight => 
  `- ${insight.severity.toUpperCase()}: ${insight.title}
    Category: ${insight.category}
    Description: ${insight.description}
    Recommendation: ${insight.recommendation}
    Risk Score: Impact ${insight.impact}/10, Probability ${insight.probability}/10`
).join('\n')}

Please provide a professional, well-structured report in markdown format.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a professional security consultant writing formal security assessment reports. Use clear, professional language and proper report structure."
          },
          {
            role: "user",
            content: fullPrompt
          }
        ]
      });

      return response.choices[0].message.content || "Report generation failed.";

    } catch (error) {
      console.error("Error generating report content:", error);
      throw new Error("Failed to generate report content");
    }
  }

  private prepareAssessmentData(assessment: AssessmentWithQuestions): string {
    return assessment.questions.map(q => {
      let responseText = "";
      if (q.response !== null && q.response !== undefined) {
        if (typeof q.response === "boolean") {
          responseText = q.response ? "Yes" : "No";
        } else {
          responseText = q.response.toString();
        }
      } else {
        responseText = "No response";
      }

      return `Category: ${q.category}
Question: ${q.question}
Type: ${q.type}
Weight: ${q.weight}
Response: ${responseText}
${q.notes ? `Notes: ${q.notes}` : ""}
${q.evidence && q.evidence.length > 0 ? `Evidence: ${q.evidence.join(", ")}` : ""}`;
    }).join("\n\n");
  }

  private validateSeverity(severity: string): "low" | "medium" | "high" | "critical" {
    const validSeverities = ["low", "medium", "high", "critical"];
    return validSeverities.includes(severity) ? severity as any : "medium";
  }
}

export const openaiService = new OpenAIService();