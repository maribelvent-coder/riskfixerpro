import { db } from "../db";
import { reportRecipes, narrativePrompts } from "@shared/schema";
import { executiveSummaryRecipe } from "../config/recipes/executive-summary-ep";
import { narrativePrompts as promptTemplates } from "../config/narrative-prompts";
import { sql } from "drizzle-orm";

async function seedReportRecipes() {
  console.log("Seeding report recipes...");

  try {
    await db.insert(reportRecipes).values({
      id: executiveSummaryRecipe.id,
      name: executiveSummaryRecipe.name,
      description: executiveSummaryRecipe.description || null,
      reportType: executiveSummaryRecipe.reportType,
      assessmentTypes: executiveSummaryRecipe.assessmentTypes,
      sections: executiveSummaryRecipe.sections,
      toneSetting: executiveSummaryRecipe.toneSetting,
      branding: executiveSummaryRecipe.branding || null,
      pageLayout: executiveSummaryRecipe.pageLayout || null,
      isActive: true,
      version: 1,
    }).onConflictDoUpdate({
      target: reportRecipes.id,
      set: {
        name: executiveSummaryRecipe.name,
        description: executiveSummaryRecipe.description || null,
        reportType: executiveSummaryRecipe.reportType,
        assessmentTypes: executiveSummaryRecipe.assessmentTypes,
        sections: executiveSummaryRecipe.sections,
        toneSetting: executiveSummaryRecipe.toneSetting,
        branding: executiveSummaryRecipe.branding || null,
        pageLayout: executiveSummaryRecipe.pageLayout || null,
        updatedAt: sql`now()`,
      },
    });

    console.log(`Inserted/updated recipe: ${executiveSummaryRecipe.id}`);
  } catch (error) {
    console.error("Error inserting recipe:", error);
    throw error;
  }

  console.log("Seeding narrative prompts...");

  for (const prompt of promptTemplates) {
    try {
      await db.insert(narrativePrompts).values({
        id: prompt.id,
        sectionId: prompt.sectionId,
        systemPrompt: prompt.systemPrompt,
        userPromptTemplate: prompt.userPromptTemplate,
        outputConstraints: prompt.outputConstraints || null,
        version: 1,
      }).onConflictDoUpdate({
        target: narrativePrompts.id,
        set: {
          sectionId: prompt.sectionId,
          systemPrompt: prompt.systemPrompt,
          userPromptTemplate: prompt.userPromptTemplate,
          outputConstraints: prompt.outputConstraints || null,
          updatedAt: sql`now()`,
        },
      });

      console.log(`Inserted/updated prompt: ${prompt.id}`);
    } catch (error) {
      console.error(`Error inserting prompt ${prompt.id}:`, error);
      throw error;
    }
  }

  console.log("Seed completed successfully!");
}

seedReportRecipes()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
