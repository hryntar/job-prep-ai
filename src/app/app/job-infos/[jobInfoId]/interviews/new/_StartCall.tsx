"use client";

import { Button } from "@/components/ui/button";
import { JobInfoTable } from "@/drizzle/schema";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";

export function StartCall({
  accessToken,
  jobInfo,
  user,
}: {
  accessToken: string;
  jobInfo: Pick<typeof JobInfoTable.$inferSelect, "id" | "title" | "description" | "experienceLevel">;
  user: { name: string; imageUrl: string };
}) {
   const {connect, readyState, disconnect} = useVoice();

   if (readyState == VoiceReadyState.IDLE) {
      return <div className="flex justify-center items-center h-screen-header">
         <Button size="lg" onClick={async () => {
            connect({
               auth: {type: "accessToken", value: accessToken},
               
            })
         }}>Start Interview</Button>
      </div>
   }

   if (readyState == VoiceReadyState.CONNECTING || readyState == VoiceReadyState.CLOSED) {
      return null
   }

  return "Connected";
}
