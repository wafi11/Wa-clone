"use client";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { BookMarks, Header } from "../bookmarks/Header";

const Favorite = () => {
  const me = useQuery(api.users.getMe);
  const favorite = useQuery(api.bookmarks.getFavorites, {
    userId: me?._id!,
  });
  return (
    <div className="space-y-4 p-5 w-3/4">
      <Header title="Favorite" />
      <div className="space-y-2 w-full">
        {favorite?.map((book: any) => {
          return <BookMarks key={book?.message._id} data={book?.message} />;
        })}
      </div>
    </div>
  );
};

export default Favorite;
