import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const createBookMarks = mutation({
  args: {
    message: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) return new ConvexError("Unauthorized");

    const existingMessages = await ctx.db
      .query("bookmarks")
      .withIndex("By_message", (q) => q.eq("message", args.message))
      .first();

    if (existingMessages) {
      throw new ConvexError("Message not found");
    }
    await ctx.db.insert("bookmarks", {
      message: args.message,
      isBookmarks: true,
      userId: args.userId,
    });
  },
});
export const createFavorite = mutation({
  args: {
    message: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) return new ConvexError("Unauthorized");

    const existingMessages = await ctx.db
      .query("favorite")
      .withIndex("By_message", (q) => q.eq("message", args.message))
      .first();

    if (existingMessages) {
      throw new ConvexError("Message not found");
    }
    await ctx.db.insert("favorite", {
      message: args.message,
      isFavorite: true,
      userId: args.userId,
    });
  },
});

export const getBookmarks = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("By_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.field("isBookmarks"))
      .collect();

    const messages = await Promise.all(
      bookmarks.map(async (fav) => {
        const message = await ctx.db.get(fav.message);
        if (!message) return null;

        const sender = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), message.sender))
          .first();

        const validSender = sender || {
          _id: "",
          image: "",
          name: "",
          tokenIdentifier: "",
          email: "",
          _creationTime: 0,
          isOnline: false,
        };

        return {
          ...fav,
          message: {
            ...message,
            sender: validSender,
          },
        };
      })
    );
    return messages;
  },
});
export const getFavorites = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const bookmarks = await ctx.db
      .query("favorite")
      .withIndex("By_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.field("isFavorite"))
      .collect();

    const messages = await Promise.all(
      bookmarks.map(async (fav) => {
        const message = await ctx.db.get(fav.message);
        if (!message) return null;

        const sender = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), message.sender))
          .first();

        const validSender = sender || {
          _id: "",
          image: "",
          name: "",
          tokenIdentifier: "",
          email: "",
          _creationTime: 0,
          isOnline: false,
        };

        return {
          ...fav,
          message: {
            ...message,
            sender: validSender,
          },
        };
      })
    );
    return messages;
  },
});

export const deleteBookmark = mutation({
  args: {
    message: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_id", (q) => q.eq("_id", args.message))
      .first();

    if (!bookmark) {
      throw new ConvexError("Bookmark not found");
    }

    await ctx.db.delete(bookmark._id);
  },
});

// Delete Favorite
export const deleteFavorite = mutation({
  args: {
    message: v.id("favorite"),
  },
  handler: async (ctx, args) => {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const favorite = await ctx.db
      .query("favorite")
      .withIndex("by_id", (q) => q.eq("_id", args.message))
      .first();

    if (!favorite) {
      throw new ConvexError("Favorite not found");
    }

    await ctx.db.delete(favorite._id);
  },
});
