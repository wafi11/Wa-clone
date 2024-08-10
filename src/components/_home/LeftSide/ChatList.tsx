"use client";
import { useConvexAuth, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useInputStore } from "@/hooks/chat-store";
import Conversations from "../_components/Conversations";
import { Loader2 } from "lucide-react";
import SearchResults from "../_components/SearchResults";

export default function ChatList() {
  const { msg } = useInputStore();
  const { isAuthenticated, isLoading: messageLoading } = useConvexAuth();
  const conversations = useQuery(
    api.conversations.getMyConversations,
    isAuthenticated ? undefined : "skip"
  );
  const {
    results,
    status,
    loadMore,
    isLoading: Loading,
  } = usePaginatedQuery(
    api.Messages.AllMessages,
    { query: msg },
    { initialNumItems: 5 }
  );

  if (messageLoading || Loading) {
    return (
      <div className="w-full flex  h-[calc(100% -500px)] justify-center items-center ">
        <Loader2 className="animate-spin  size-4" />
      </div>
    );
  }

  if (!results || conversations?.length === 0) {
    <>
      <p className="text-center text-gray-500 text-sm mt-3">
        No conversations yet
      </p>
      <p className="text-center text-gray-500 text-sm mt-3">
        We understand {"you're"} an introvert, but {"you've"} got to start
        somewhere 😊
      </p>
    </>;
  }

  return (
    <div className="my-3 flex flex-col gap-0 max-h-[80%] overflow-auto">
      {results && results?.length > 0 ? (
        <SearchResults results={results} />
      ) : (
        conversations?.map((conversation) => (
          <Conversations key={conversation._id} conversation={conversation} />
        ))
      )}
    </div>
  );
}
