import { Id } from "../../convex/_generated/dataModel";
import { create } from "zustand";

export type Conversation = {
  _id: Id<"conversations">;
  image?: string;
  participants: Id<"users">[];
  isGroup: boolean;
  name?: string;
  groupImage?: string;
  groupName?: string;
  admin?: Id<"users">;
  isOnline?: boolean;
  lastMessage?: {
    _id: Id<"messages">;
    conversation: Id<"conversations">;
    content: string;
    delivered: boolean;
    read: boolean;
    sender: Id<"users">;
  };
};

type ConversationStore = {
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
};
type ReplyChatStore = {
  selectedMessages: IMessage | null;
  setSelectedMessages: (conversation: IMessage | null) => void;
  clearSelectedMessage: () => void; // Add the clearSelectedMessage method
};
type ReplyToReplyChatStore = {
  selectedReply: ReplyChat | null;
  setSelectedReply: (conversation: ReplyChat | null) => void;
  clearSelectedReply: () => void; // Add the clearSelectedMessage method
};

export const useConversationStore = create<ConversationStore>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) =>
    set({ selectedConversation: conversation }),
}));
export const useReplyChatStore = create<ReplyChatStore>((set) => ({
  selectedMessages: null,
  setSelectedMessages: (conversation) =>
    set({ selectedMessages: conversation }),
  clearSelectedMessage: () => set({ selectedMessages: null }), // Implement the clearSelectedMessage method
}));
export const useReplyToReplyStore = create<ReplyToReplyChatStore>((set) => ({
  selectedReply: null,
  setSelectedReply: (conversation) => set({ selectedReply: conversation }),
  clearSelectedReply: () => set({ selectedReply: null }), // Implement the clearSelectedMessage method
}));

export interface IMessage {
  _id: Id<"messages">;
  content: string;
  _creationTime: number;
  read: boolean;
  delivered: boolean;
  delivered_At?: string | undefined;
  read_At?: string | undefined;
  messageType: "text" | "image" | "video";
  sender: {
    _id: Id<"users">;
    image: string;
    name?: string;
    tokenIdentifier: string;
    email: string;
    _creationTime: number;
    isOnline: boolean;
  };
}
export interface User {
  _id: Id<"users">;
  image: string;
  name?: string;
  tokenIdentifier: string;
  email: string;
  _creationTime: number;
  isOnline: boolean;
}
export interface IMessages {
  _id: Id<"messages">;
  _creationTime: number;
  delivered_At?: string | undefined;
  read_At?: string | undefined;
  conversation: Id<"conversations">;
  sender: string;
  delivered: boolean;
  read: boolean;
  content: string;
  messageType: "image" | "text" | "video";
}

export interface ReplyChat {
  _id: Id<"replyMessages">;
  _creationTime: number;
  type: "text" | "icon";
  sender: string;
  content: string;
  originalMessageId: Id<"messages">;
  parentReplyId?: Id<"replyMessages">;
  replyToMessageId: Id<"messages"> | Id<"replyMessages">;
}

export interface RepliesData {
  originalMessage: IMessages[];
  replies: ReplyChat[];
}
