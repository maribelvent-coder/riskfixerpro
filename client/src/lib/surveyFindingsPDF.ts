import {
  createPDF,
  addHeader,
  addSection,
  addText,
  checkPageBreak,
  addPageNumbers,
  PDF_CONFIG,
} from './pdfService';
import type { Assessment, FacilitySurveyQuestion } from '@shared/schema';

const { SPACING, FONT_SIZES, COLORS } = PDF_CONFIG;

export async function generateSurveyFindingsPDF(assessmentId: string): Promise<void> {
  try {
    console.log(`Starting Survey Findings PDF generation for assessment ${assessmentId}`);

    const [assessmentRes, facilitySurveyRes] = await Promise.all([
      fetch(`/api/assessments/${assessmentId}`),
      fetch(`/api/assessments/${assessmentId}/facility-survey-questions`),
    ]);

    if (!assessmentRes.ok || !facilitySurveyRes.ok) {
      throw new Error('Failed to fetch assessment data');
    }

    const assessment: Assessment = await assessmentRes.json();
    const facilityQuestions: FacilitySurveyQuestion[] = await facilitySurveyRes.json();

    console.log('Data fetched successfully:', {
      facilityQuestions: facilityQuestions.length,
    });

    const doc = createPDF();
    let yPos = SPACING.margin;

    // Title Page
    addHeader(doc, 'Physical Security Assessment Findings', assessment.title || 'Untitled Assessment');
    yPos += 40;

    // Assessment Metadata
    doc.setFontSize(FONT_SIZES.body);
    doc.setTextColor(...COLORS.text);
    addText(doc, `Location: ${assessment.location}`, SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    addText(doc, `Assessor: ${assessment.assessor}`, SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    addText(doc, `Date: ${new Date(assessment.createdAt || Date.now()).toLocaleDateString()}`, SPACING.margin, yPos);
    yPos += SPACING.sectionGap * 2;

    // Executive Summary
    yPos = checkPageBreak(doc, yPos, 40);
    yPos = addSection(doc, 'Executive Summary', yPos);
    
    const answeredQuestions = facilityQuestions.filter(q => q.response || q.notes);
    const totalQuestions = facilityQuestions.length;
    const completionRate = totalQuestions > 0 ? Math.round((answeredQuestions.length / totalQuestions) * 100) : 0;

    addText(doc, `This report presents findings from a comprehensive physical security assessment conducted in accordance with ASIS and ANSI standards.`, SPACING.margin, yPos, { maxWidth: 170 });
    yPos += SPACING.lineHeight * 2;
    
    addText(doc, `Assessment Completion: ${completionRate}% (${answeredQuestions.length} of ${totalQuestions} questions answered)`, SPACING.margin, yPos);
    yPos += SPACING.sectionGap * 2;

    // Group questions by category
    const questionsByCategory = facilityQuestions.reduce((acc, question) => {
      const category = question.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(question);
      return acc;
    }, {} as Record<string, FacilitySurveyQuestion[]>);

    // Survey Findings by Category
    yPos = checkPageBreak(doc, yPos, 40);
    yPos = addSection(doc, 'Assessment Findings by Category', yPos);

    for (const [category, questions] of Object.entries(questionsByCategory)) {
      yPos = checkPageBreak(doc, yPos, 50);
      
      // Category Header
      doc.setFontSize(FONT_SIZES.heading);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      addText(doc, category.toUpperCase(), SPACING.margin, yPos);
      yPos += SPACING.lineHeight + 2;
      
      // Draw separator line
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.5);
      doc.line(SPACING.margin, yPos, 190, yPos);
      yPos += SPACING.smallGap;

      // Group by subcategory within this category
      const bySubcategory = questions.reduce((acc, q) => {
        const sub = q.subcategory || 'General';
        if (!acc[sub]) {
          acc[sub] = [];
        }
        acc[sub].push(q);
        return acc;
      }, {} as Record<string, FacilitySurveyQuestion[]>);

      for (const [subcategory, subQuestions] of Object.entries(bySubcategory)) {
        yPos = checkPageBreak(doc, yPos, 40);
        
        // Subcategory Header
        doc.setFontSize(FONT_SIZES.subheading);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        addText(doc, subcategory, SPACING.margin + 5, yPos);
        yPos += SPACING.lineHeight;

        // Questions in this subcategory
        for (const question of subQuestions) {
          yPos = checkPageBreak(doc, yPos, 35);

          // Question text
          doc.setFontSize(FONT_SIZES.body);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.text);
          const questionLines = doc.splitTextToSize(`Q: ${question.question}`, 160);
          questionLines.forEach((line: string) => {
            addText(doc, line, SPACING.margin + 10, yPos);
            yPos += SPACING.lineHeight;
          });

          // Response
          if (question.response) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.textLight);
            let responseText = `Response: `;
            
            // Format response based on type
            if (question.type === 'yes-no') {
              responseText += question.response === 'yes' ? 'Yes' : question.response === 'no' ? 'No' : question.response;
            } else if (question.type === 'rating') {
              responseText += `${question.response}/5`;
            } else {
              responseText += question.response;
            }
            
            const responseLines = doc.splitTextToSize(responseText, 160);
            responseLines.forEach((line: string) => {
              addText(doc, line, SPACING.margin + 10, yPos);
              yPos += SPACING.lineHeight;
            });
          }

          // Notes
          if (question.notes) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...COLORS.muted);
            const notesLines = doc.splitTextToSize(`Notes: ${question.notes}`, 160);
            notesLines.forEach((line: string) => {
              addText(doc, line, SPACING.margin + 10, yPos);
              yPos += SPACING.lineHeight;
            });
          }

          // Best Practice Reference (if available)
          if (question.bestPractice) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(FONT_SIZES.small);
            doc.setTextColor(...COLORS.info);
            const bpLines = doc.splitTextToSize(`Best Practice: ${question.bestPractice}`, 160);
            bpLines.forEach((line: string) => {
              addText(doc, line, SPACING.margin + 10, yPos);
              yPos += SPACING.lineHeight - 1;
            });
          }

          yPos += SPACING.smallGap;
        }

        yPos += SPACING.smallGap;
      }

      yPos += SPACING.sectionGap;
    }

    // Recommendations Section
    yPos = checkPageBreak(doc, yPos, 60);
    yPos = addSection(doc, 'Key Observations & Recommendations', yPos);

    // Find questions with concerning responses or detailed notes
    const concerningFindings = facilityQuestions.filter(q => 
      (q.response === 'no' || q.response === 'poor' || q.response === 'critical') ||
      (q.notes && q.notes.length > 20 && !q.notes.includes('[Section Skipped]'))
    );

    if (concerningFindings.length > 0) {
      addText(doc, `The following ${concerningFindings.length} items require attention or further review:`, SPACING.margin, yPos, { maxWidth: 170 });
      yPos += SPACING.lineHeight + 3;

      concerningFindings.slice(0, 15).forEach((finding, index) => {
        yPos = checkPageBreak(doc, yPos, 25);
        
        doc.setFontSize(FONT_SIZES.body);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.danger);
        addText(doc, `${index + 1}.`, SPACING.margin, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.text);
        const findingText = `${finding.category} - ${finding.subcategory}: ${finding.question}`;
        const findingLines = doc.splitTextToSize(findingText, 165);
        findingLines.forEach((line: string) => {
          addText(doc, line, SPACING.margin + 10, yPos);
          yPos += SPACING.lineHeight;
        });

        if (finding.notes && !finding.notes.includes('[Section Skipped]')) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(FONT_SIZES.small);
          doc.setTextColor(...COLORS.muted);
          const noteLines = doc.splitTextToSize(`Note: ${finding.notes}`, 165);
          noteLines.forEach((line: string) => {
            addText(doc, line, SPACING.margin + 10, yPos);
            yPos += SPACING.lineHeight - 1;
          });
        }

        yPos += SPACING.smallGap + 2;
      });
    } else {
      addText(doc, `No critical findings identified during this assessment.`, SPACING.margin, yPos);
      yPos += SPACING.lineHeight;
    }

    yPos += SPACING.sectionGap;

    // Next Steps
    yPos = checkPageBreak(doc, yPos, 40);
    yPos = addSection(doc, 'Next Steps', yPos);
    
    addText(doc, `1. Review all findings with facility management and security personnel`, SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    addText(doc, `2. Prioritize remediation actions based on risk severity`, SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    addText(doc, `3. Develop implementation timeline for recommended improvements`, SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    addText(doc, `4. Consider conducting a full risk analysis to quantify vulnerabilities`, SPACING.margin, yPos);
    yPos += SPACING.lineHeight;
    addText(doc, `5. Schedule follow-up assessment to verify corrective actions`, SPACING.margin, yPos);

    // Add page numbers
    addPageNumbers(doc);

    // Save the PDF
    const filename = `${assessment.title?.replace(/[^a-z0-9]/gi, '_') || 'Assessment'}_Survey_Findings_${Date.now()}.pdf`;
    doc.save(filename);

    console.log(`Survey Findings PDF generated successfully: ${filename}`);
  } catch (error) {
    console.error('Error generating Survey Findings PDF:', error);
    throw error;
  }
}
