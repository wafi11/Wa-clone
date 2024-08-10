"use client";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useToast } from "@/components/ui/use-toast";
import ChatPlaceHolder from "@/components/_home/RightPanel/Chat-plaecholder";
import { api } from "../../../../convex/_generated/api";
import SearchPage from "../Search";
import { Id } from "../../../../convex/_generated/dataModel";

interface HomeProps {
  searchParams: {
    q?: string;
  };
}

export default function Home({ searchParams }: HomeProps) {
  const { toast } = useToast();
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
  useEffect(() => {
    handleUpdateMessages();
    const intervalId = setInterval(() => handleUpdateMessages(), 6000);
    return () => clearInterval(intervalId);
  }, []);

  return searchParams.q ? (
    <SearchPage q={searchParams.q as Id<"conversations">} />
  ) : (
    <ChatPlaceHolder />
  );
}
