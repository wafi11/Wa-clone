import React, { Fragment } from "react";
import { IMessages, ReplyChat, useReplyToReplyStore } from "@/hooks/chat-store";
import MessageStatus from "@/hooks/lib/MessageStatus";
import { getTime } from "@/hooks/lib/utils";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface Props {
  replyData: {
    originalMessage: IMessages;
    replies: ReplyChat[];
  };
  fromMe: boolean;
}
const getOriginalMessage = (
  replies: ReplyChat[],
  messageId: string
): ReplyChat | undefined => {
  return replies.find((reply) => reply._id.toString() === messageId);
};

export default function ReplyChats({ replyData, fromMe }: Props) {
  if (replyData.replies.length === 0 || !replyData.replies) return null;

  const containerClass = fromMe ? "ml-auto" : "mr-auto";
  const bgClass = fromMe ? "bg-green-chat" : "bg-white dark:bg-gray-primary";

  const renderReply = (reply: any) => {
    const time = getTime(reply._creationTime);
    const originalReply = reply.replyToMessageId
      ? getOriginalMessage(replyData.replies, reply.replyToMessageId)
      : null;

    return (
      <div
        key={reply._id.toString()}
        className={`rounded-lg shadow-md overflow-hidden ${bgClass}`}
      >
        {originalReply && (
          <div className="px-4 py-2 bg-opacity-10 bg-emerald-100 items-center">
            <p className="truncate">{originalReply.content}</p>
          </div>
        )}
        <div className="px-3 py-2 relative group">
          <div className="flex space-x-2">
            <span>{reply.content}</span>
            <p className="text-[10px] mt-3 py-1 self-end flex gap-1 items-center">
              {time} {fromMe && <MessageStatus />}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`flex mt-2 w-fit max-w-[40%] ${containerClass}`}>
        {replyData.originalMessage && (
          <div className={`rounded-lg shadow-md overflow-hidden ${bgClass}`}>
            <div className="px-4 py-2 bg-opacity-10 bg-emerald-100 items-center">
              <p className="truncate">{replyData.originalMessage.content}</p>
            </div>
            {replyData.replies.map((reply) => (
              <Fragment key={reply._id.toString()}>
                {!reply.parentReplyId && renderReply(reply)}
              </Fragment>
            ))}
          </div>
        )}
      </div>
      <div className={`flex mt-2 w-fit max-w-[40%] ${containerClass}`}>
        {replyData.replies.map((reply) => (
          <Fragment key={reply._id.toString()}>
            {reply.parentReplyId && renderReply(reply)}
          </Fragment>
        ))}
      </div>
    </>
  );
}
interface PropsReply {
  reply: ReplyChat;
}

function MoreReplyChat({ reply }: PropsReply) {
  const { setSelectedReply } = useReplyToReplyStore();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white  border-none">
          <DropdownMenuItem
            onClick={() => setSelectedReply(reply)}
            className="bg-white text-black"
          >
            <span>Reply</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
