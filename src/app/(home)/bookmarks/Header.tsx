import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IMessage } from "@/hooks/chat-store";
import React from "react";

export const Header = ({ title }: { title: string }) => {
  return (
    <div className="flex justify-between items-center border-b-2 w-full">
      <h2 className="text-3xl font-semibold mb-2">{title}</h2>
    </div>
  );
};

interface Props {
  data?: IMessage;
}

export const BookMarks = ({ data }: Props) => {
  if (!data) return null;
  return (
    <div className="w-full h-fit p-3 bg-gray-700 rounded-md">
      <div className="flex gap-4 items-center ">
        <Avatar>
          <AvatarImage
            src={data.sender.image}
            className="rounded-full object-cover w-10 h-10 "
          />
          <AvatarFallback className="w-10 h-10">
            <div className="animate-pulse bg-gray-tertiary rounded-full"></div>
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-between flex-grow">
          <p className="text-white font-semibold">{data.sender.name}</p>
          <p className="text-gray-300 mt-1">{data.content}</p>
        </div>
      </div>
    </div>
  );
};
