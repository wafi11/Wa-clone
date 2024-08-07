"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, X } from "lucide-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import MessageContainer from "../_components/MessageContainer";
import MessageInput from "../_components/MessageInput";
import { useConversationStore } from "@/hooks/chat-store";
import GroupMembersDialog from "./GroupMembersDialog";
import ChatPlaceHolder from "./Chat-plaecholder";
import { useToast } from "@/components/ui/use-toast";
import { api } from "../../../../convex/_generated/api";
import { useEffect } from "react";

const RightPanel = () => {
  const { toast } = useToast();
  const updateMessages = useMutation(api.Messages.MarkRead);
  const me = useQuery(api.users.getMe);
  const { selectedConversation, setSelectedConversation } =
    useConversationStore();
  const { isLoading } = useConvexAuth();

  useEffect(() => {
    if (selectedConversation?.participants.includes(me?._id!)) {
      const handleUpdateMessages = async () => {
        try {
          await updateMessages({
            conversationid: selectedConversation._id,
            sender: me?._id!,
          });
        } catch (error) {
          toast({ description: "Internal Server Error" });
        }
      };

      handleUpdateMessages();
      const intervalId = setInterval(handleUpdateMessages, 60000);
      return () => clearInterval(intervalId);
    }
  }, [selectedConversation, me?._id, updateMessages, toast]);

  if (isLoading) return null;
  if (!selectedConversation) return <ChatPlaceHolder />;

  const conversationName =
    selectedConversation.groupName || selectedConversation.name;
  const conversationImage =
    selectedConversation.groupImage || selectedConversation.image;

  return (
    <div className="w-3/4 flex flex-col">
      <div className="w-full sticky top-0 z-50">
        <div className="flex justify-between bg-gray-primary p-3">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage
                src={conversationImage || "/placeholder.png"}
                className="object-cover"
              />
              <AvatarFallback>
                <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p>{conversationName}</p>
              <p>
                {!selectedConversation.isGroup &&
                  (selectedConversation.isOnline ? "Online" : "Offline")}
              </p>
              {selectedConversation.isGroup && (
                <GroupMembersDialog
                  selectedConversation={selectedConversation}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-7 mr-5">
            <a href="/video-call" target="_blank">
              <Video size={23} />
            </a>
            <X
              size={16}
              className="cursor-pointer"
              onClick={() => setSelectedConversation(null)}
            />
          </div>
        </div>
      </div>
      <MessageContainer />
      <MessageInput />
    </div>
  );
};

export default RightPanel;
