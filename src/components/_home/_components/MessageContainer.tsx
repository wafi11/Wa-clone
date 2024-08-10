import { useConversationStore } from "@/hooks/chat-store";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import ChatBubble from "./ChatBubble";
import { Id } from "../../../../convex/_generated/dataModel";
import { useToast } from "@/components/ui/use-toast";

const MessageList = ({ conversationId }: { conversationId: any }) => {
  const { toast } = useToast();
  const messages = useQuery(api.Messages.getMessages, {
    conversation: conversationId,
  });
  const me = useQuery(api.users.getMe);
  const update = useMutation(api.Messages.MarkRead);
  useEffect(() => {
    const handleUpdateMessages = async (id: string) => {
      if (me?._id! !== id) return;
      try {
        await update({
          conversationid: conversationId,
        });
      } catch (error) {
        toast({ description: "Internal Server Error" });
      }
    };
    const interval = setInterval(() => {
      handleUpdateMessages(me?._id!);
    }, 5000);

    return () => clearInterval(interval); // membersihkan interval saat komponen di-unmount
  }, []);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {messages?.map((msg, idx) => (
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

interface Ids {
  id?: Id<"conversations">;
}

const MessageContainer = ({ id }: Ids) => {
  return (
    <div className="relative p-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark">
      <div className="mx-12 flex flex-col gap-3">
        <MessageList conversationId={id} />
      </div>
    </div>
  );
};

export default MessageContainer;
