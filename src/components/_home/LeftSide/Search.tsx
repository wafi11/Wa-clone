"use client";
import { Input } from "@/components/ui/input";
import { ListFilter, Search } from "lucide-react";
import { useInputStore } from "@/hooks/chat-store";
import { ChangeEvent } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function SearchInput() {
  const { msg, setMsg } = useInputStore();

  const handlesearch = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value!.trim();
    setMsg(searchTerm);
  };

  return (
    <div className="p-3 flex items-center">
      <div className="relative h-10 mx-3 flex-1">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
          size={18}
        />
        <Input
          type="text"
          placeholder="Search or start a new chat"
          onChange={handlesearch}
          value={msg}
          className="pl-10 py-2 text-sm w-full rounded shadow-sm bg-gray-primary focus-visible:ring-transparent"
        />
      </div>
      <ListMenu />
    </div>
  );
}

function ListMenu() {
  const { push } = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <ListFilter className="cursor-pointer" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800">
        <DropdownMenuItem
          onClick={() => push("/favorite")}
          className="hover:bg-gray-500 border-2 border-gray-500"
        >
          <span>Favorite</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => push("/bookmarks")}
          className="hover:bg-gray-500 border-2 border-gray-500"
        >
          <span>Bookmarks</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
