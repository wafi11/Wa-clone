import { IMessage, useConversationStore } from "@/hooks/chat-store";
import { useQuery } from "convex/react";
import { Suspense, useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import ChatBubble from "./ChatBubble";
import { Loader2 } from "lucide-react";

// Komponen untuk menampilkan pesan-pesan
const MessageList = ({ conversationId }: { conversationId: any }) => {
  const messages = useQuery(api.Messages.getMessages, {
    conversation: conversationId,
  });
  const me = useQuery(api.users.getMe);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  if (!messages || !me) return null;

  return (
    <>
      {messages.map((msg, idx) => (
        <div
          key={msg._id}
          ref={idx === messages.length - 1 ? lastMessageRef : undefined}
        >
          <ChatBubble
            message={msg}
            me={me}
            previousMessage={idx > 0 ? messages[idx - 1] : undefined}
          />
        </div>
      ))}
    </>
  );
};

// Komponen utama
const MessageContainer = () => {
  const { selectedConversation } = useConversationStore();

  if (!selectedConversation) {
    return <div>No conversation selected</div>;
  }

  return (
    <div className="relative p-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark">
      <div className="mx-12 flex flex-col gap-3">
        <MessageList conversationId={selectedConversation._id} />
      </div>
    </div>
  );
};

export default MessageContainer;
