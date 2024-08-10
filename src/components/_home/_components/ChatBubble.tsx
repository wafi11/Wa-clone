import { IMessage, useConversationStore } from "@/hooks/chat-store";
import ChatBubbleAvatar from "./ChatAvatar";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription } from "../../ui/dialog";
import DateIndicator from "./DateIndicator";
import ReactPlayer from "react-player";
import MessageMoreButton from "./MessageMoreButton";

import { getTime } from "@/hooks/lib/utils";
import MessageStatus from "@/hooks/lib/MessageStatus";

type ChatBubbleProps = {
  message: IMessage | any;
  me: any;
  previousMessage?: IMessage | any;
};

const ChatBubble = ({ me, message, previousMessage }: ChatBubbleProps) => {
  const time = getTime(message._creationTime);
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

  return (
    <>
      <DateIndicator message={message} previousMessage={previousMessage} />
      <div
        className={`flex gap-4  w-fit max-w-[40%] ${fromMe ? "ml-auto" : ""} group cursor-pointer h-full `}
      >
        {!fromMe && (
          <ChatBubbleAvatar
            isGroup={isGroup}
            isMember={isMember}
            message={message}
          />
        )}
        <div
          className={`flex ${message.isReply && "flex-col"} w-fit gap-2 justify-between  px-4 py-2 rounded-md shadow-sm relative ${bgClass} ${fromMe ? "ml-auto" : ""}`}
        >
          {message.isReply && message.replyToMessage && (
            <div className="relative  p-2 w-full bg-gray-300 border-l-4 border-green-500 rounded-md">
              <p className="ml-4 text-gray-800">
                {message.replyToMessage.content}
              </p>
            </div>
          )}
          {fromMe && <SelfMessageIndicator />}
          {renderMessageContent()}
          {open && (
            <ImageDialog
              src={message.content}
              open={open}
              onClose={() => setOpen(false)}
            />
          )}
          <div
            className={`absolute top-0 ${fromMe ? "right-0" : "left-0"} invisible group-hover:visible`}
          >
            <MessageMoreButton
              id={message._id}
              message={message}
              fromMe={fromMe}
              storageId={message.storageId}
            />
          </div>
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
    <p className="text-[10px]   self-end flex gap-1 items-end">
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
        <p className={` text-sm font-light h-fit w-fit `}>{message.content}</p>
      )}
    </>
  );
};
