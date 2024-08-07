import { MessageSeenSvg } from "@/hooks/lib/SVG";
import {
  IMessage,
  RepliesData,
  ReplyChat,
  useConversationStore,
} from "@/hooks/chat-store";
import ChatBubbleAvatar from "./ChatAvatar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription } from "../../ui/dialog";
import DateIndicator from "./DateIndicator";
import ReactPlayer from "react-player";
import MessageMoreButton from "./MessageMoreButton";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import MessageStatus from "@/hooks/lib/MessageStatus";
import ReplyChats from "./replyChat";
import { getTime } from "@/hooks/lib/utils";

type ChatBubbleProps = {
  message: IMessage;
  me: any;
  previousMessage?: IMessage;
};

const ChatBubble = ({ me, message, previousMessage }: ChatBubbleProps) => {
  const time = getTime(message._creationTime);
  const isReplyMessage = "originalMessageId" in message;
  let originalMessage;

  const replyData = useQuery(api.replyMessages.GetRepliesForMessage, {
    originalMessageId: message._id as Id<"messages">,
  });
  const { selectedConversation } = useConversationStore();
  const isMember =
    selectedConversation?.participants.includes(message.sender?._id) || false;
  const isGroup = selectedConversation?.isGroup;
  const fromMe = message.sender?._id === me._id;
  const bgClass = fromMe ? "bg-green-chat" : "bg-white dark:bg-gray-primary";

  const [open, setOpen] = useState(false);

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return <TextMessage message={message} />;
      case "image":
        return (
          <ImageMessage message={message} handleClick={() => setOpen(true)} />
        );
      case "video":
        return <VideoMessage message={message} />;
      default:
        return null;
    }
  };

  if (!fromMe) {
    return (
      <>
        <DateIndicator message={message} previousMessage={previousMessage} />
        <div className="flex gap-1 w-2/3">
          <ChatBubbleAvatar
            isGroup={isGroup}
            isMember={isMember}
            message={message}
          />
          <div
            className={`flex flex-col z-20 max-w-fit px-2 pt-1 rounded-md shadow-md relative ${bgClass}`}
          >
            {renderMessageContent()}
            {open && (
              <ImageDialog
                src={message.content}
                open={open}
                onClose={() => setOpen(false)}
              />
            )}
            <MessageTime
              time={time}
              fromMe={fromMe}
              delivered={message.delivered}
              read={message.read}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DateIndicator message={message} previousMessage={previousMessage} />
      <div className="flex gap-1 w-full max-w-[40%] ml-auto relative group">
        <div
          className={`flex  z-20 max-w-fit px-2 pt-1 rounded-md shadow-md ml-auto relative ${bgClass}`}
        >
          <SelfMessageIndicator />
          {renderMessageContent()}
          {open && (
            <ImageDialog
              src={message.content}
              open={open}
              onClose={() => setOpen(false)}
            />
          )}
          <div className="absolute top-0 right-0 invisible group-hover:visible">
            <MessageMoreButton id={message._id} message={message} />
          </div>
          <MessageTime
            time={time}
            fromMe={fromMe}
            delivered={message.delivered}
            read={message.read}
          />
        </div>
      </div>
      {message._id === replyData?.originalMessage._id && (
        <ReplyChats replyData={replyData} fromMe={fromMe} />
      )}
    </>
  );
};
export default ChatBubble;

const VideoMessage = ({ message }: { message: IMessage }) => {
  return (
    <ReactPlayer
      url={message.content}
      width="250px"
      height="250px"
      controls={true}
      light={true}
    />
  );
};

const ImageMessage = ({
  message,
  handleClick,
}: {
  message: IMessage;
  handleClick: () => void;
}) => {
  return (
    <div className="w-[250px] h-[250px] m-2 relative">
      <Image
        src={message.content}
        fill
        className="cursor-pointer object-cover rounded"
        alt="image"
        onClick={handleClick}
      />
    </div>
  );
};

const ImageDialog = ({
  src,
  onClose,
  open,
}: {
  open: boolean;
  src: string;
  onClose: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="min-w-[750px]">
        <DialogDescription className="relative h-[450px] flex justify-center">
          <Image
            src={src}
            fill
            className="rounded-lg object-contain"
            alt="image"
          />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

const MessageTime = ({
  time,
  fromMe,
  delivered,
  read,
}: {
  time: string;
  fromMe: boolean;
  delivered: boolean;
  read: boolean;
}) => {
  return (
    <p className="text-[10px] mt-3 py-1 self-end flex gap-1 items-center">
      {time} {fromMe && <MessageStatus delivered={delivered} read={read} />}
    </p>
  );
};

const OtherMessageIndicator = () => (
  <div className="absolute bg-white dark:bg-gray-primary top-0 -left-[4px] w-3 h-3 rounded-bl-full" />
);

export const SelfMessageIndicator = () => (
  <div className="absolute bg-green-chat top-0 -right-[3px] w-3 h-3 rounded-br-full overflow-hidden" />
);

const TextMessage = ({ message }: { message: IMessage }) => {
  const isLink = /^(ftp|http|https):\/\/[^ "]+$/.test(message.content); // Check if the content is a URL

  return (
    <>
      {isLink ? (
        <a
          href={message.content}
          target="_blank"
          rel="noopener noreferrer"
          className={`mr-2 text-sm font-light text-blue-400 underline`}
        >
          {message.content}
        </a>
      ) : (
        <p className={` text-sm font-light h-fit`}>{message.content}</p>
      )}
    </>
  );
};
