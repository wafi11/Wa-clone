import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
export const createConversation = mutation({
  args: {
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.id("_storage")),
    admin: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.eq(q.field("participants"), args.participants),
          q.eq(q.field("participants"), args.participants.reverse())
        )
      )
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    let groupImage;

    if (args.groupImage) {
      groupImage = (await ctx.storage.getUrl(args.groupImage)) as string;
    }

    const conversationId = await ctx.db.insert("conversations", {
      participants: args.participants,
      isGroup: args.isGroup,
      groupName: args.groupName,
      groupImage,
      admin: args.admin,
    });

    return conversationId;
  },
});
export const getMyConversations = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new ConvexError("User not found");

    const conversations = await ctx.db.query("conversations").collect();

    const myConversations = conversations.filter((conversation) => {
      return conversation.participants.includes(user._id);
    });

    const conversationsWithDetails = await Promise.all(
      myConversations.map(async (conversation) => {
        let userDetails = {};

        if (!conversation.isGroup) {
          const otherUserId = conversation.participants.find(
            (id) => id !== user._id
          );
          const userProfile = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), otherUserId))
            .take(1);

          userDetails = userProfile[0];
        }

        const lastMessage = await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("conversation"), conversation._id))
          .order("desc")
          .take(1);

        return {
          ...userDetails,
          ...conversation,
          lastMessage: lastMessage[0] || null,
        };
      })
    );

    return conversationsWithDetails;
  },
});
export const getMyConversationsSearch = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new ConvexError("User not found");

    const conversations = await ctx.db.query("conversations").collect();

    const myConversations = conversations.filter((conversation) => {
      return conversation.participants.includes(user._id);
    });

    const conversationsWithDetails = await Promise.all(
      myConversations.map(async (conversation) => {
        let userDetails = {};

        if (!conversation.isGroup) {
          const otherUserId = conversation.participants.find(
            (id) => id !== user._id
          );
          const userProfile = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), otherUserId))
            .take(1);

          userDetails = userProfile[0];
        }

        const AllMessages = await ctx.db
          .query("messages")
          .withSearchIndex("search_body", (q) =>
            q.search("content", args.query)
          )
          .collect();

        const lastMessage = await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("conversation"), conversation._id))
          .order("desc")
          .take(1);
        return {
          ...userDetails,
          ...conversation,
          ...AllMessages,
          lastMessage: lastMessage[0] || [],
        };
      })
    );

    return conversationsWithDetails;
  },
});
export const getMyConversationsById = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { conversationId } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new ConvexError("User not found");

    const Myconversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), conversationId))
      .first();

    if (!Myconversations) throw new ConvexError("Conversation not found");

    const otherParticipantId = Myconversations.participants.find(
      (participantId) => participantId !== user._id
    );

    let receiver = null;
    if (otherParticipantId) {
      receiver = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("_id"), otherParticipantId))
        .first();
    }

    const getAllMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversation", args.conversationId)
      )
      .filter((q) => q.eq(q.field("conversation"), Myconversations?._id))
      .collect();

    const userProfileCache = new Map();

    const messagesWithSender = await Promise.all(
      getAllMessages.map(async (message) => {
        let sender;
        if (userProfileCache.has(message.sender)) {
          sender = userProfileCache.get(message.sender);
        } else {
          sender = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), message.sender))
            .first();
          userProfileCache.set(message.sender, sender);
        }
        let replyToMessage = null;
        if (message.replyTo) {
          replyToMessage = await ctx.db.get(message.replyTo);
        }

        return { ...message, sender, replyToMessage };
      })
    );

    return {
      ...Myconversations,
      receiver,
      messages: messagesWithSender,
    };
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
