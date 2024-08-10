"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, X } from "lucide-react";
import Link from "next/link";
import MessageContainer from "@/components/_home/_components/MessageContainer";
import MessageInput from "@/components/_home/_components/MessageInput";
import GroupMembersDialog from "@/components/_home/RightPanel/GroupMembersDialog";
import { useRouter } from "next/navigation";
import { formatDate } from "@/hooks/lib/FormatDate";

interface Props {
  q: Id<"conversations">;
}

export default function SearchPage({ q }: Props) {
  const data = useQuery(api.conversations.getMyConversationsById, {
    conversationId: q,
  });
  const { push } = useRouter();
  const conversationName = data?.groupName || data?.receiver?.name;
  const conversationImage = data?.groupImage || data?.receiver?.image;
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
              <p className="text-[14px] text-gray-500">
                {!data?.isGroup &&
                  (data?.receiver?.isOnline
                    ? "online"
                    : data?.receiver?._creationTime
                      ? `last seen ${formatDate(data?.receiver?._creationTime)}`
                      : "...")}
              </p>
              {data?.isGroup && <GroupMembersDialog ids={data._id} />}
            </div>
          </div>

          <div className="flex items-center gap-7 mr-5">
            <Link href="/video-call" target="_blank">
              <Video size={23} />
            </Link>
            <X size={16} className="cursor-pointer" onClick={() => push("/")} />
          </div>
        </div>
      </div>
      <MessageContainer id={q} />
      <MessageInput id={q} />
    </div>
  );
}
