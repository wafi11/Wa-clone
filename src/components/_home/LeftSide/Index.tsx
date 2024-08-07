import ChatList from "./ChatList";
import HeaderLeftSide from "./Header";
import SearchInput from "./Search";

export default function LeftSide() {
  return (
    <div className="w-1/4 border-gray-600 border-r">
      <div className="sticky top-0 bg-left-panel z-10">
        <HeaderLeftSide />
        <SearchInput />
        <ChatList />
      </div>
    </div>
  );
}
