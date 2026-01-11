import { db } from "@/drizzle/db";
import { QuestionTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { getQuestionIdTag } from "@/features/questions/dbCache";
import { generateAiQuestionFeedback } from "@/services/ai/questions";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import z from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
   prompt: z.string().min(1),
   questionId: z.string().min(1),
   answer: z.string().min(1).optional(),
})

export async function POST(req: Request) {
   const body = await req.json();
   const result = schema.safeParse(body);

   if (!result.success) {
      return new Response("Error generating feedback", { status: 400 });
   }
   const { questionId } = result.data;
   const answer = result.data.answer ?? result.data.prompt;

   if (answer.trim() === "") {
      return new Response("Error generating feedback", { status: 400 });
   }

   const { userId } = await getCurrentUser()
   if (userId == null) {
      return new Response("Unauthorized", { status: 401 });
   }

   const question = await getQuestion(questionId, userId);
   if (question == null) {
      return new Response("Question not found", { status: 404 });
   }

   const res = generateAiQuestionFeedback({
      question: question.text,
      answer
   })

   return res.toTextStreamResponse();
}

async function getQuestion(questionId: string, userId: string) {
   "use cache";
   cacheTag(getQuestionIdTag(questionId));

   const question = await db.query.QuestionTable.findFirst({
      where: eq(QuestionTable.id, questionId),
      with: {
         jobInfo: { columns: { id: true, userId: true } }
      }
   });

   if (question == null) {
      return null;
   }
   cacheTag(getJobInfoIdTag(question.jobInfo.id));

   if (question.jobInfo.userId !== userId) {
      return null;
   }

   return question;
}
