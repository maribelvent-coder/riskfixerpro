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
      
      const prompt = `You are a Certified Protection Professional (CPP) with expertise in ASIS International standards and physical security design principles. Analyze the security assessment data following professional standards.

PROFESSIONAL STANDARDS TO APPLY:
=================================

LIGHTING STANDARDS:
- Detection: 0.5 fc minimum intensity
- Recognition: 1.0 fc minimum intensity  
- Identification: 2.0 fc minimum intensity
- Parking structures: 5 fc with 4:1 uniformity ratio
- Key parameters: Intensity and evenness of illumination

CAMERA SYSTEM STANDARDS:
- General (5 Px/ft): Basic human activity detection
- Monitor (7 Px/ft): General human/vehicle monitoring
- Detect (11 Px/ft): Human detection but not identification
- Observe (18 Px/ft): Clothing and colors distinguishable
- Recognize (35 Px/ft): Known individual identification
- Identify (46 Px/ft): Beyond shadow of doubt identification
- License plates: 70 Px/ft minimum
- Facial recognition: 88 Px/ft minimum

ACCESS CONTROL & BARRIER PRINCIPLES:
- Balanced design: Each barrier element should provide equal delay
- Detection, Deterrence, Delay, Response integration
- Redundant systems for critical areas
- Entry control performance standards

THREAT CATEGORIES (ASIS/ANSI Standards):
- Human Threats: Theft, fraud, vandalism, sabotage, unauthorized access
- Environmental Threats: Natural disasters, power outages, extreme weather  
- Technical Threats: System failures, cyber attacks on physical systems
- Operational Threats: Supply chain disruption, human error, non-compliance

RISK ANALYSIS FRAMEWORK:
- Risk = Threat + Consequence + Vulnerability
- Consider adversary capability, equipment, motivation, intent
- Evaluate likelihood based on frequency/probability
- Assess consequences as undesirable outcomes
- Identify PPS (Physical Protection System) weaknesses

Assessment Details:
- Facility: ${assessment.title}
- Location: ${assessment.location}
- Assessor: ${assessment.assessor}

Assessment Questions and Responses:
${assessmentData}

Analyze using professional standards and respond with JSON containing:
1. overallRiskScore: 1-100 based on threat/vulnerability/consequence analysis
2. insights: Array of professional risk findings with:
   - category: Specific security domain (Access Control, Lighting Systems, Surveillance, Barriers, etc.)
   - severity: "low", "medium", "high", or "critical" 
   - title: Professional risk finding title
   - description: Technical assessment of security gap
   - recommendation: Specific technical recommendation with standards
   - impact: 1-10 consequence if exploited
   - probability: 1-10 likelihood based on threat analysis
3. executiveSummary: Professional executive summary

Apply technical standards, reference specific metrics where applicable, and provide actionable professional recommendations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a Certified Protection Professional (CPP) with expertise in ASIS International and ANSI standards, physical security systems design, and risk assessment methodologies. Reference specific technical standards, measurements, and professional best practices in your analysis."
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
    let dataText = "";
    
    // Check for enhanced risk assessment data first
    if (assessment.riskAssets && assessment.riskAssets.length > 0) {
      dataText += "IDENTIFIED ASSETS:\n";
      dataText += assessment.riskAssets.map(asset => 
        `- ${asset.name} (${asset.type})
   Criticality: ${asset.criticality}/5
   Owner: ${asset.owner || 'N/A'}
   ${asset.scope ? `Scope: ${asset.scope}` : ''}
   ${asset.notes ? `Notes: ${asset.notes}` : ''}`
      ).join("\n\n");
      dataText += "\n\n";
    }
    
    if (assessment.riskScenarios && assessment.riskScenarios.length > 0) {
      dataText += "RISK SCENARIOS:\n";
      dataText += assessment.riskScenarios.map(scenario => {
        const asset = assessment.riskAssets?.find(a => a.id === scenario.assetId);
        return `- Asset: ${asset?.name || scenario.asset}
   Scenario: ${scenario.scenario}
   Likelihood: ${scenario.likelihood}
   Impact: ${scenario.impact}
   Risk Level: ${scenario.riskLevel}`;
      }).join("\n\n");
      dataText += "\n\n";
    }
    
    // Include legacy facility survey questions if available
    if (assessment.questions && assessment.questions.length > 0) {
      dataText += "FACILITY SURVEY QUESTIONS:\n";
      dataText += assessment.questions.map(q => {
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
    
    return dataText || "No assessment data available.";
  }

  private validateSeverity(severity: string): "low" | "medium" | "high" | "critical" {
    const validSeverities = ["low", "medium", "high", "critical"];
    return validSeverities.includes(severity) ? severity as any : "medium";
  }
}

export const openaiService = new OpenAIService();