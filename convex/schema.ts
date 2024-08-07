import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.string(),
    tokenIdentifier: v.string(),
    isOnline: v.boolean(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    admin: v.optional(v.id("users")),
  }),

  messages: defineTable({
    conversation: v.id("conversations"),
    sender: v.string(),
    delivered: v.boolean(),
    read: v.boolean(),
    delivered_At: v.optional(v.string()),
    read_At: v.optional(v.string()),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video")
    ),
  }).index("by_conversation", ["conversation"]),
  replyMessages: defineTable({
    originalMessageId: v.id("messages"),
    replyToMessageId: v.union(v.id("messages"), v.id("replyMessages")),
    parentReplyId: v.optional(v.id("replyMessages")), // This allows nesting replies
    sender: v.string(),
    delivered: v.boolean(),
    read: v.boolean(),
    delivered_At: v.optional(v.string()),
    read_At: v.optional(v.string()),
    type: v.union(v.literal("icon"), v.literal("text")),
    content: v.string(),
  })
    .index("by_originalMessageId", ["originalMessageId"])
    .index("by_replyToMessageId", ["replyToMessageId"])
    .index("by_parentReplyId", ["parentReplyId"]),
});
