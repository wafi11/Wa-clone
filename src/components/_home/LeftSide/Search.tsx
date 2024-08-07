import { Input } from "@/components/ui/input";
import { ListFilter, Search } from "lucide-react";

export default function SearchInput() {
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
          className="pl-10 py-2 text-sm w-full rounded shadow-sm bg-gray-primary focus-visible:ring-transparent"
        />
      </div>
      <ListFilter className="cursor-pointer" />
    </div>
  );
}
