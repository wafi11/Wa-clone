import { Id } from "../../convex/_generated/dataModel";
import { create } from "zustand";

export type Conversation = {
  _id: Id<"conversations">;
  image?: string;
  participants: Id<"users">[];
  isGroup: boolean;
  lastSeen: number;
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

type Input = {
  msg: string;
  setMsg: (msg: string) => void;
};

export const useConversationStore = create<ConversationStore>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) =>
    set({ selectedConversation: conversation }),
}));
export const useMessageStore = create<ReplyChatStore>((set) => ({
  selectedMessages: null,
  setSelectedMessages: (selectedMessages) =>
    set({ selectedMessages: selectedMessages }),
  clearSelectedMessage: () => set({ selectedMessages: null }),
}));

export const useInputStore = create<Input>((set) => ({
  msg: "",
  setMsg: (newMsg: string) => set({ msg: newMsg }),
}));

export interface IMessage {
  _id: Id<"messages">;
  content: string;
  _creationTime: number;
  isReply: boolean;
  replyTo?: string; // id of the message this one replies to, if any
  forwardedFrom?: string;
  read: boolean;
  delivered: boolean;
  delivered_At?: string | undefined;
  read_At?: string | undefined;
  replyToMessage?: IMessage;
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
  _id: Id<"users"> | string;
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

export interface RepliesData {
  originalMessage: IMessages[];
}

type MessageType = "text" | "image" | "video"; // Example of possible message types

interface SenderType {
  email: string;
  image: string;
  isOnline: boolean;
  lastSeen: number;
  name: string;
  tokenIdentifier: string;
  _creationTime: number;
  _id: string;
}

export interface Messagesss {
  content: string;
  conversation: string;
  delivered: boolean;
  delivered_At?: string;
  isReply: boolean;
  messageType: MessageType;
  read: boolean;
  sender: SenderType;
  _creationTime: number;
  _id: string;
}
