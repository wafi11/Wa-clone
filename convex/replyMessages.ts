import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateReplyMessages = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    sender: v.string(),
  },
  handler: async (ctx, args) => {
    const { content, messageId, sender } = args;
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const originalMessage = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("_id"), messageId))
      .first();
    if (!originalMessage) {
      throw new ConvexError("Original message not found");
    }

    await ctx.db.insert("replyMessages", {
      content,
      originalMessageId: messageId,
      replyToMessageId: messageId,
      sender,
      read: false,
      delivered: false,
      type: "text",
    });
  },
});

export const RepliesToReplChat = mutation({
  args: {
    repliesId: v.id("replyMessages"),
    content: v.string(),
    sender: v.string(),
  },
  handler: async (ctx, args) => {
    const { content, repliesId, sender } = args;
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const originalReply = await ctx.db
      .query("replyMessages")
      .filter((q) => q.eq(q.field("_id"), repliesId))
      .first();
    if (!originalReply) {
      throw new ConvexError("Reply message not found");
    }

    await ctx.db.insert("replyMessages", {
      content,
      originalMessageId: originalReply.originalMessageId,
      replyToMessageId: repliesId,
      sender,
      read: false,
      delivered: false,
      type: "text",
      parentReplyId: repliesId, // Link to the parent reply
    });
  },
});

export const GetRepliesForMessage = query({
  args: {
    originalMessageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const { originalMessageId } = args;

    // Fetch the original message details
    const originalMessage = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("_id"), originalMessageId))
      .first();

    if (!originalMessage) {
      throw new ConvexError("Original message not found");
    }

    // Fetch replies and include the original message details
    const replies = await ctx.db
      .query("replyMessages")
      .filter((q) => q.eq(q.field("originalMessageId"), originalMessageId))
      .collect();

    return {
      originalMessage,
      replies,
    };
  },
});
