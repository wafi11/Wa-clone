import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.string(),
    tokenIdentifier: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.optional(v.number()),
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
    storageId: v.optional(v.id("_storage")),
    isReply: v.boolean(),
    replyTo: v.optional(v.id("messages")),
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
  })
    .index("by_conversation", ["conversation"])
    .searchIndex("search_body", {
      searchField: "content",
      filterFields: ["content"],
    }),
  bookmarks: defineTable({
    message: v.id("messages"),
    userId: v.id("users"),
    isBookmarks: v.boolean(),
  })
    .index("By_message", ["message"])
    .index("By_user", ["userId"]),
  favorite: defineTable({
    message: v.id("messages"),
    userId: v.id("users"),
    isFavorite: v.boolean(),
  })
    .index("By_message", ["message"])
    .index("By_user", ["userId"]),
});
