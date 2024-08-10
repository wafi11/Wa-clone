import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createReply = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    sender: v.id("users"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { content, conversation, messageId, sender } = args;
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    if (!content || !sender || !conversation || !messageId) {
      throw new ConvexError("Message Aren't Valid");
    }

    const message = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("_id"), messageId))
      .unique();

    const createMessages = await ctx.db.insert("messages", {
      content,
      conversation,
      isReply: true,
      replyTo: message?._id,
      messageType: "text",
      sender,
      delivered: false,
      read: false,
    });

    return createMessages;
  },
});

export const getReplaysData = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const { messageId } = args;

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("replyTo"), messageId))
      .first();

    if (!messageId) {
      throw new ConvexError("Message Aren't Valid");
    }

    const replies = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("isReply"), true))
      .collect();

    return {
      ...messages,
      ...replies,
    };
  },
});
