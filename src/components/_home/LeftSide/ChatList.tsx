"use client";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConversationStore } from "@/hooks/chat-store";
import { useEffect } from "react";
import Conversations from "../_components/Conversations";
import { useToast } from "@/components/ui/use-toast";

export default function ChatList() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const conversations = useQuery(
    api.conversations.getMyConversations,
    isAuthenticated ? undefined : "skip"
  );
  const updateMessages = useMutation(api.Messages.updateReceivedMessages);
  const handleUpdateMessages = async () => {
    try {
      const result = await updateMessages();
      return result;
    } catch (error) {
      toast({
        description: "Internal Server Error",
      });
    }
  };
  const { selectedConversation, setSelectedConversation } =
    useConversationStore();

  useEffect(() => {
    const conversationIds = conversations?.map(
      (conversation) => conversation._id
    );
    if (
      selectedConversation &&
      conversationIds &&
      !conversationIds.includes(selectedConversation._id)
    ) {
      setSelectedConversation(null);
    }
    handleUpdateMessages();
    const intervalId = setInterval(() => handleUpdateMessages(), 60000);
    return () => clearInterval(intervalId);
  }, [conversations, selectedConversation, setSelectedConversation]);

  if (isLoading) return null;
  return (
    <div className="my-3 flex flex-col gap-0 max-h-[80%] overflow-auto">
      {conversations?.map((conversation) => (
        <Conversations key={conversation._id} conversation={conversation} />
      ))}

      {conversations?.length === 0 && (
        <>
          <p className="text-center text-gray-500 text-sm mt-3">
            No conversations yet
          </p>
          <p className="text-center text-gray-500 text-sm mt-3 ">
            We understand {"you're"} an introvert, but {"you've"} got to start
            somewhere 😊
          </p>
        </>
      )}
    </div>
  );
}
