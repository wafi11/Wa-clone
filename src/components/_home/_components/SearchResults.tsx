import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Messagesss } from "@/hooks/chat-store";
import { useQuery } from "convex/react";
import React, { Fragment } from "react";
import { formatDate } from "@/hooks/lib/FormatDate";
import { useRouter } from "next/navigation";

interface Props {
  results: Messagesss[];
}

const SearchResults = ({ results }: Props) => {
  const { push } = useRouter();
  return (
    <>
      {results.map((rslt) => (
        <Fragment key={rslt._id}>
          <div
            className={`flex  gap-2  p-3 hover:bg-chat-hover cursor-pointer
                bg-gray-tertiary
				`}
            onClick={() => push(`/chat?q=${rslt.conversation}`)}
          >
            <Avatar className="border border-gray-900 overflow-visible relative">
              {rslt.sender.isOnline && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground" />
              )}
              <AvatarImage
                src={rslt.sender.image || "/placeholder.png"}
                className="object-cover rounded-full"
              />
              <AvatarFallback>
                <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
              </AvatarFallback>
            </Avatar>
            <div className="w-full flex flex-col">
              <p className="flex items-center justify-between">
                <span className="text-sm font-medium">{rslt.sender.name}</span>
                <span className="text-xs place-items-start text-gray-300">
                  {formatDate(rslt._creationTime)}
                </span>
              </p>
              <p className="text-sm ">{rslt.content}</p>
            </div>
          </div>
          <hr className="h-[1px] mx-10 bg-gray-primary" />
        </Fragment>
      ))}
    </>
  );
};

export default SearchResults;
