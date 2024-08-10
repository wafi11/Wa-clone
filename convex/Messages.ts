import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const sendTextMessage = mutation({
  args: {
    sender: v.string(),
    content: v.string(),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversation))
      .first();

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .filter((q) => q.and(q.eq(q.field("isOnline"), true)))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    if (!conversation.participants.includes(user._id)) {
      throw new ConvexError("You are not part of this conversation");
    }

    await ctx.db.insert("messages", {
      sender: args.sender,
      content: args.content,
      conversation: args.conversation,
      messageType: "text",
      isReply: false,
      delivered: false,
      read: false,
    });
  },
});

export const getMessages = query({
  args: {
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversation", args.conversation)
      )
      .order("asc")
      .collect();

    const userProfileCache = new Map();

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
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

    return messagesWithSender;
  },
});

export const sendImage = mutation({
  args: {
    imgId: v.id("_storage"),
    sender: v.id("users"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const content = (await ctx.storage.getUrl(args.imgId)) as string;

    await ctx.db.insert("messages", {
      content: content,
      sender: args.sender,
      messageType: "image",
      conversation: args.conversation,
      isReply: false,
      storageId: args.imgId,
      delivered: false,
      read: false,
    });
  },
});

export const sendVideo = mutation({
  args: {
    videoId: v.id("_storage"),
    sender: v.id("users"),
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const content = (await ctx.storage.getUrl(args.videoId)) as string;

    await ctx.db.insert("messages", {
      content: content,
      sender: args.sender,
      storageId: args.videoId,
      messageType: "video",
      conversation: args.conversation,
      isReply: false,
      delivered: false,
      read: false,
    });
  },
});

export const deleteMessages = mutation({
  args: {
    id: v.id("messages"),
    storage_id: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    await ctx.db.delete(args.id);
    if (args.storage_id) {
      await ctx.storage.delete(args.storage_id);
    }
  },
});

export const getMessageById = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const message = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("_id"), args.messageId))
      .unique();

    if (!message) {
      throw new ConvexError("Message not found");
    }
    const sender = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), message.sender))
      .unique();

    return { ...message, sender };
  },
});

export const updateReceivedMessages = mutation({
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
    const myConversations = conversations.filter((conversation) =>
      conversation.participants.some((id) => id !== user._id)
    );

    const allUsers = await ctx.db.query("users").collect();
    const onlineUsers = allUsers.filter(
      (users) => users.isOnline && users._id !== user._id
    );

    let totalUpdatedCount = 0;

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

          userDetails = userProfile[0] || {};
        }

        const isAnyParticipantOnline = conversation.participants.some((id) =>
          onlineUsers.some((onlineUser) => onlineUser._id !== user._id)
        );

        if (isAnyParticipantOnline) {
          const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
              q.eq("conversation", conversation._id)
            )
            .filter((q) => q.eq(q.field("delivered"), false))
            .collect();

          // Update messages to set 'delivered' to true
          const updateMessages = await Promise.all(
            messages.map((message) =>
              ctx.db.patch(message._id, {
                delivered: true,
                delivered_At: new Date().toISOString(),
              })
            )
          );

          totalUpdatedCount += updateMessages.length;
        }

        return {
          ...userDetails,
          ...conversation,
        };
      })
    );

    return {
      conversations: conversationsWithDetails,
      updatedCount: totalUpdatedCount,
    };
  },
});

export const getMessageUnread = query({
  args: {
    conversationid: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { conversationid, userId } = args;

    let count;
    const unreadMessages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("conversation"), conversationid))
      .filter((q) => q.eq(q.field("read"), false))
      .filter((q) => q.neq(q.field("sender"), userId))
      .collect();
    count = unreadMessages.length;

    if (count === 0) {
      return null;
    }

    return count;
  },
});

export const MarkRead = mutation({
  args: {
    conversationid: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { conversationid } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .filter((q) => q.and(q.eq(q.field("isOnline"), true)))
      .unique();
    const unreadMessages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("conversation"), conversationid))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    unreadMessages.map((message) => {
      if (message.sender === user?._id) return;
      ctx.db.patch(message._id, {
        read: true,
        read_At: new Date().toISOString(),
      });
    });

    return unreadMessages;
  },
});

export const AllMessages = query({
  args: {
    query: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("messages")
      .withSearchIndex("search_body", (q) => q.search("content", args.query))
      .paginate(args.paginationOpts);

    const userprofile = new Map();
    const mappedPage = [];
    for (const msg of results.page) {
      let Sender;

      if (userprofile.has(msg.sender)) {
        Sender = userprofile.get(msg.sender);
      } else {
        Sender = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), msg.sender))
          .first();
        if (Sender) {
          userprofile.set(msg.sender, Sender);
        }
      }

      if (Sender) {
        mappedPage.push({
          ...msg,
          sender: Sender,
        });
      }
    }

    return {
      ...results,
      page: mappedPage,
      continueCursor: results.continueCursor, // Ensure it's a string
      nextCursor: results.continueCursor, // Use an empty string if results.continueCursor is undefined or null
    };
  },
});
