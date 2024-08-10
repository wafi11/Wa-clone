"use client";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function App() {
  const [msg, setMsg] = useState("");
  //   const { results, status, loadMore, isLoading } = usePaginatedQuery(
  //     api.Messages.AllMessages,
  //     {},
  //     { initialNumItems: 1 }
  //   );

  //   console.log(results);
  return (
    <div className="bg-black text-white">
      {/* {results?.map((msg, indx) => <div key={indx}>{msg.message}</div>)}
      <button onClick={() => loadMore(1)} disabled={status !== "CanLoadMore"}>
        Load More
      </button> */}
    </div>
  );
}
