import z from "zod";

const categorySchema = z.object({
   score: z.number().min(0).max(10).describe("Score of the category from 1 to 10"),
   summary: z.string().describe("Summary of the category analysis"),
   feedback: z.array(z.object({
      type: z.enum(["strength", "minor-improvement", "major-improvement"]).describe("Type of feedback"),
      name: z.string().describe("Name of the feedback"),
      message: z.string().describe("Description of the feedback"),
   })).describe("Specific feedback on positives and negatives")
})

export const aiAnalyzeSchema = z.object({
   overallScore: z.number().min(0).max(10).describe("Overall score of the resume from 0 to 10"),
   ats: categorySchema.describe("Analysis of how well the resume matches ATS requirements"),
   jobMatch: categorySchema.describe("Analysis of how well the resume matches the job description"),
   writingAndFormatting: categorySchema.describe("Analysis of how well the resume matches writing and formatting of the resume (taking into account the job requirements)"),
   keywordCoverage: categorySchema.describe("Analysis of how well the resume covers relevant keywords (taking into account the job requirements)"),
   other: categorySchema.describe("Other analysis aspects of the resume"),
})