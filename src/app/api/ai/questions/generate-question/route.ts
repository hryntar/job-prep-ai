import { db } from "@/drizzle/db";
import { JobInfoTable, questionDifficulties, QuestionDifficulty, QuestionTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { insertQuestion } from "@/features/questions/db";
import { getQuestionJobInfoTag } from "@/features/questions/dbCache";
import { canCreateQuestion } from "@/features/questions/permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { generateAiQuestion } from "@/services/ai/questions";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { and, asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import z from "zod";

const schema = z.object({
   // legacy useCompletion shape
   prompt: z.enum(questionDifficulties).optional(),
   // useChat shape
   messages: z.array(z.any()).optional(),
   jobInfoId: z.string().min(1),
})

export async function POST(req: Request) {
   const body = await req.json();
   const result = schema.safeParse(body);

   if (!result.success) {
      return new Response("Error generating question", { status: 400 });
   }
   const { prompt, messages, jobInfoId } = result.data;

   const difficulty: QuestionDifficulty | undefined = (() => {
      if (prompt != null) return prompt;

      if (!Array.isArray(messages)) return undefined;

      const lastUser = [...messages].reverse().find((m): m is Record<string, unknown> => {
         return typeof m === "object" && m != null && (m as Record<string, unknown>).role === "user";
      });

      const parts = lastUser?.parts;
      if (!Array.isArray(parts)) return undefined;

      const textPart = parts.find((p): p is Record<string, unknown> => {
         return typeof p === "object" && p != null && (p as Record<string, unknown>).type === "text";
      });

      const text = textPart?.text;
      if (typeof text !== "string") return undefined;

      const allowed = questionDifficulties as readonly string[];
      if (!allowed.includes(text)) return undefined;
      return text as QuestionDifficulty;
   })();

   if (difficulty == null) {
      return new Response("Invalid difficulty", { status: 400 });
   }
   const { userId } = await getCurrentUser()
   if (userId == null) {
      return new Response("Unauthorized", { status: 401 });
   }

   if (!(await canCreateQuestion())) {
      return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
   }

   const jobInfo = await getJobInfo(jobInfoId, userId);
   if (jobInfo == null) {
      return new Response("Job info not found", { status: 404 });
   }

   const previousQuestions = await getQuestions(jobInfoId);

   const stream = createUIMessageStream({
      execute: ({ writer }) => {
         const result = generateAiQuestion({
            previousQuestions,
            jobInfo,
            difficulty,
            onFinish: async question => {
               const { id } = await insertQuestion({
                  text: question,
                  jobInfoId,
                  difficulty,
               });

               writer.write({
                  type: "data-question",
                  data: { questionId: id },
               });
            },
         });

         writer.merge(result.toUIMessageStream({ sendStart: true, sendFinish: true }));
      },
   });

   return createUIMessageStreamResponse({ stream });
}

async function getQuestions(jobInfoId: string) {
   "use cache";
   cacheTag(getQuestionJobInfoTag(jobInfoId));

   return db.query.QuestionTable.findMany({
      where: eq(QuestionTable.jobInfoId, jobInfoId),
      orderBy: asc(QuestionTable.createdAt),
   });
}

async function getJobInfo(jobInfoId: string, userId: string) {
   "use cache";
   cacheTag(getJobInfoIdTag(jobInfoId));

   return db.query.JobInfoTable.findFirst({
      where: and(eq(JobInfoTable.id, jobInfoId), eq(JobInfoTable.userId, userId)),
   });
}