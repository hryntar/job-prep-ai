import { JobInfoTable } from "@/drizzle/schema";
import { generateText, stepCountIs } from "ai"
import { fetchChatMessages } from "../hume/lib/api";
import { generateAiInterviewFeedbackPrompt } from "./models/interview-feedback.prompt";
import { google } from "./models/google";

export async function generateAiInterviewFeedback({
   humeChatId,
   jobInfo,
   userName
}: {
   humeChatId: string;
   jobInfo: Pick<typeof JobInfoTable.$inferSelect, "title" | "description" | "experienceLevel">;
   userName: string;
}) {
   const messages = await fetchChatMessages(humeChatId);
   const formattedMessages = messages.map(m => {
      if (m.type !== "USER_MESSAGE" && m.type !== "AGENT_MESSAGE") return null;
      if (m.messageText == null) return null;

      return {
         speaker: m.type === "USER_MESSAGE" ? "interviewee" : "interviewer",
         text: m.messageText,
         emotionFeatures: m.role === "USER" ? m.emotionFeatures : undefined,
      }
   })

   const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: JSON.stringify(formattedMessages),
      stopWhen: stepCountIs(10),
      system: generateAiInterviewFeedbackPrompt(
         userName,
         jobInfo
      )
   })

   return text;
}