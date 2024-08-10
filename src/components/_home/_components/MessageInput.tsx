import { Laugh, Mic, Send } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useConversationStore, useMessageStore } from "@/hooks/chat-store";
import useComponentVisible from "@/hooks/useComponentsVisible";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MediaDropdown from "./MediaDropdown";
import { Id } from "../../../../convex/_generated/dataModel";

interface Ids {
  id?: Id<"conversations">;
}

const MessageInput = ({ id }: Ids) => {
  const { toast } = useToast();
  const [msgText, setMsgText] = useState("");
  const createReplyChat = useMutation(api.replyMessages.createReply);
  const { selectedMessages, clearSelectedMessage } = useMessageStore();
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);
  const me = useQuery(api.users.getMe);
  const sendTextMsg = useMutation(api.Messages.sendTextMessage);

  const handleCreateReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) return;

    try {
      await createReplyChat({
        content: msgText,
        conversation: id!,
        sender: me._id,
        messageId: selectedMessages?._id!,
      });
      setMsgText("");
      clearSelectedMessage();
    } catch (err) {
      toast({
        description: "Cannot Create Message",
      });
    }
  };

  const handleSendNewMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) return;

    try {
      await sendTextMsg({
        content: msgText,
        conversation: id!,
        sender: me._id,
      });
      setMsgText("");
    } catch (err) {
      toast({
        description: "Cannot Create Message",
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    if (selectedMessages) {
      handleCreateReply(e);
    } else {
      handleSendNewMessage(e);
    }
  };

  return (
    <div className="bg-gray-primary p-2 flex flex-col gap-4 items-center">
      {selectedMessages && (
        <div className="bg-gray-800 rounded-lg mb-2 w-full max-h-[50%]">
          <span className="font-semibold">Replying to:</span>
          <div className="bg-gray-600 p-2 rounded-lg shadow-sm mt-1">
            <p>{selectedMessages.content}</p>
          </div>
        </div>
      )}
      <div className="flex w-full">
        <div className="relative flex gap-2 ml-2 items-center">
          <div ref={ref} onClick={() => setIsComponentVisible(true)}>
            {isComponentVisible && (
              <EmojiPicker
                theme={Theme.DARK}
                onEmojiClick={(emojiObject) => {
                  setMsgText((prev) => prev + emojiObject.emoji);
                }}
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  left: "1rem",
                  zIndex: 50,
                }}
              />
            )}
            <Laugh className="text-gray-600 dark:text-gray-400" />
          </div>
          <MediaDropdown id={id!} />
        </div>
        <form onSubmit={handleSubmit} className="w-full flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type Something...."
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
