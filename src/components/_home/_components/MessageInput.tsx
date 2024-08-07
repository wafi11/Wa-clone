import { Laugh, Mic, Plus, Send } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  useConversationStore,
  useReplyChatStore,
  useReplyToReplyStore,
} from "@/hooks/chat-store";
import useComponentVisible from "@/hooks/useComponentsVisible";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MediaDropdown from "./MediaDropdown";
import { Id } from "../../../../convex/_generated/dataModel";

const MessageInput = () => {
  const { toast } = useToast();
  const { selectedMessages, clearSelectedMessage } = useReplyChatStore(); // Add clearSelectedMessage to reset reply state
  const [msgText, setMsgText] = useState("");
  const { selectedReply, clearSelectedReply } = useReplyToReplyStore();
  const [isReplyMode, setIsReplyMode] = useState(false);
  const { selectedConversation } = useConversationStore();
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);
  const ReverseReply = useMutation(api.replyMessages.RepliesToReplChat);
  const createReply = useMutation(api.replyMessages.CreateReplyMessages);
  const me = useQuery(api.users.getMe);
  const sendTextMsg = useMutation(api.Messages.sendTextMessage);

  useEffect(() => {
    if (selectedReply) {
      setIsReplyMode(true);
    } else if (selectedMessages) {
      setIsReplyMode(true);
    } else {
      setIsReplyMode(false);
    }
  }, [selectedReply, selectedMessages]);

  const handleSendTextMsg = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReplyMode && selectedReply) {
      await handleCreateReverseReply();
    } else if (isReplyMode && selectedMessages) {
      await handleCreateReply();
    } else {
      await handleSendNewMessage();
    }

    setIsReplyMode(false); // Reset reply mode after sending
    clearSelectedMessage(); // Clear the selected message
    clearSelectedReply(); // Clear the selected reply
  };

  const handleSendNewMessage = async () => {
    try {
      await sendTextMsg({
        content: msgText,
        conversation: selectedConversation!._id,
        sender: me!._id,
      });
      setMsgText("");
    } catch (err: any) {
      toast({
        description: "Cannot Create Message",
      });
      console.error(err);
    }
  };

  const handleCreateReverseReply = async () => {
    try {
      await ReverseReply({
        content: msgText,
        repliesId: selectedReply?._id as Id<"replyMessages">,
        sender: me!._id,
      });
      setMsgText("");
    } catch {
      toast({
        description: "Something Went Wrong",
      });
    }
  };

  const handleCreateReply = async () => {
    try {
      await createReply({
        messageId: selectedMessages?._id as Id<"messages">,
        content: msgText,
        sender: me!._id,
      });
      setMsgText("");
    } catch (error) {
      console.error("Failed to create reply:", error);
      toast({
        description: "Something Went Wrong",
      });
    }
  };

  return (
    <div className="bg-gray-primary p-2 flex flex-col gap-4 items-center">
      {isReplyMode && (selectedMessages || selectedReply) && (
        <div className="bg-gray-800 p-2 rounded-lg mb-2">
          <span className="font-semibold">Replying to:</span>
          <div className="bg-gray-600 p-2 rounded-lg shadow-sm mt-1">
            <p>
              {selectedMessages
                ? selectedMessages.content
                : selectedReply?.content}
            </p>
          </div>
        </div>
      )}
      <div className="flex w-full">
        <div className="relative flex gap-2 ml-2">
          <div ref={ref} onClick={() => setIsComponentVisible(true)}>
            {isComponentVisible && (
              <EmojiPicker
                theme={Theme.DARK}
                onEmojiClick={(emojiObject) => {
                  setMsgText((prev) => prev + emojiObject.emoji);
                }}
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  left: "1rem",
                  zIndex: 50,
                }}
              />
            )}
            <Laugh className="text-gray-600 dark:text-gray-400" />
          </div>
          <MediaDropdown />
        </div>
        <form onSubmit={handleSendTextMsg} className="w-full flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={
                isReplyMode ? "Reply to message..." : "Type a message"
              }
              className="py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
            />
          </div>
          <div className="mr-4 flex items-center gap-3">
            {msgText.length > 0 ? (
              <Button
                type="submit"
                size={"sm"}
                className="bg-transparent text-foreground hover:bg-transparent"
              >
                <Send />
              </Button>
            ) : (
              <Button
                type="submit"
                size={"sm"}
                className="bg-transparent text-foreground hover:bg-transparent"
              >
                <Mic />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
