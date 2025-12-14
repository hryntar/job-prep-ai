import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema/jobinfo";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { fetchAccessToken } from "hume";
import { VoiceProvider } from "@humeai/voice-react";
import { env } from "@/data/env/server";
import { StartCall } from "./_StartCall";

async function NewInterviewPage({ params }: { params: Promise<{ jobInfoId: string }> }) {
  const { jobInfoId } = await params;
  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2Icon className="size-24 animate-spin" />
        </div>
      }
    >
      <SuspendedComponent jobInfoId={jobInfoId} />
    </Suspense>
  );
}

export default NewInterviewPage;

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn, user } = await getCurrentUser({ allData: true });
  if (userId == null || user == null) return redirectToSignIn();

  const jojInfo = await getJobInfo(jobInfoId, userId);
  if (jojInfo == null) return notFound();

  const accessToken = await fetchAccessToken({
    apiKey: String(env.HUME_API_KEY),
    secretKey: String(env.HUME_SECRET_KEY),
  });

  return (
    <VoiceProvider>
      <StartCall accessToken={accessToken} jobInfo={jojInfo} user={user} />
    </VoiceProvider>
  );
}

async function getJobInfo(jobInfoId: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(jobInfoId));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, jobInfoId), eq(JobInfoTable.userId, userId)),
  });
}
