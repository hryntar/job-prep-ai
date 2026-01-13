import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { analyzeResumeForJob } from "@/services/ai/resumes/ai";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function POST(req: Request) {
   const { userId } = await getCurrentUser()
   if (userId == null) {
      return new Response("Unauthorized", { status: 401 });
   }

   const formData = await req.formData();
   const resumeFile = formData.get("resumeFile") as File;
   const jobInfoId = formData.get("jobInfoId") as string;

   if (!resumeFile || !jobInfoId) {
      return new Response("Invalid request", { status: 400 });
   }

   if (resumeFile.size > 10 * 1024 * 1024) {
      return new Response("File size exceeds 10MB limit.", { status: 400 });
   }

   const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
   ];

   if (!allowedTypes.includes(resumeFile.type)) {
      return new Response("Unsupported file format. Please upload a PDF, Word document, or text file.", { status: 400 });
   }

   const jobInfo = await getJobInfo(jobInfoId, userId);
   if (jobInfo == null) {
      return new Response("You do not have permission", { status: 403 });
   }

   if (!(await canRunResumeAnalysis())) {
      return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
   }

   const res = await analyzeResumeForJob({
      resumeFile,
      jobInfo
   })

   return res.toTextStreamResponse();
}

async function getJobInfo(jobInfoId: string, userId: string) {
   "use cache";
   cacheTag(getJobInfoIdTag(jobInfoId));

   return db.query.JobInfoTable.findFirst({
      where: and(eq(JobInfoTable.id, jobInfoId), eq(JobInfoTable.userId, userId)),
   });
}
