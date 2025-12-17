import { ConnectionMessage, JSONMessage } from "@humeai/voice-react"

type Message = JSONMessage | ConnectionMessage;

export function condensedChatMessages(messages: Message[]) {
   return messages.reduce((acc, message) => {
      const data = getJsonMessageData(message) ?? getChatEventData(message);
      if (data == null || data.content == null) return acc;

      const lastMessage = acc.at(-1);
      if (lastMessage == null) {
         acc.push({ isUser: data.isUser, content: [data.content] });
         return acc;
      }

      if (lastMessage.isUser === data.isUser) {
         lastMessage.content.push(data.content);
      } else {
         acc.push({ isUser: data.isUser, content: [data.content] });
      }

      return acc;
   }, [] as { isUser: boolean; content: string[] }[])
}

function getJsonMessageData(message: Message) {
   if (message.type !== "user_message" && message.type !== "assistant_message") {
      return null;
   }

   return { isUser: message.type === "user_message", content: message.message.content }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getChatEventData(message: any) {
   if (message.type !== "USER_MESSAGE" && message.type !== "AGENT_MESSAGE") {
      return null;
   }

   return { isUser: message.type === "user_message", content: message.messageText }
}