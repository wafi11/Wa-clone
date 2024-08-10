"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BookMarks, Header } from "./Header";

export default function Page() {
  const me = useQuery(api.users.getMe);
  const bookmarks = useQuery(api.bookmarks.getBookmarks, {
    userId: me?._id!,
  });
  return (
    <div className="space-y-4 p-5 w-3/4">
      <Header title="Bookmarks" />
      <div className="space-y-2">
        {bookmarks?.map((book: any) => {
          return <BookMarks key={book?.message._id} data={book?.message} />;
        })}
      </div>
    </div>
  );
}
