import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { ChevronDown, Trash } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { IMessage, useReplyChatStore } from "@/hooks/chat-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface Props {
  id: any;
  message: IMessage;
}

export default function MessageMoreButton({ id, message }: Props) {
  const deleteMessages = useMutation(api.Messages.deleteMessages);
  const [show, setShow] = useState<boolean>(false);
  const { setSelectedMessages } = useReplyChatStore();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <ChevronDown className="text-gray-200" size={15} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-green-chat ">
          <DropdownMenuItem
            className="z-10 hover:bg-green-primary border-2 border-green-primary"
            onClick={() => setShow(true)}
          >
            <span className="flex items-center w-full">Info</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setSelectedMessages(message)}
            className="z-10 hover:bg-green-primary border-2 border-green-primary"
          >
            <span className="flex items-center w-full">Reply</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await deleteMessages({ id });
            }}
            className="z-10 hover:bg-green-primary border-2 border-green-primary"
          >
            <span className="flex items-center w-full">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {show && (
        <InfoMessage
          onClose={() => setShow(!show)}
          show={show}
          created={message._creationTime}
          delivered={message.delivered_At}
          read={message.read_At}
        />
      )}
    </>
  );
}

interface PropsInfo {
  onClose: () => void;
  show: boolean;
  created: number;
  delivered: string | undefined;
  read: string | undefined;
}

function InfoMessage({ onClose, show, created, delivered, read }: PropsInfo) {
  const createdTime = new Date(created);
  const createdFormatted = `${createdTime.getHours().toString().padStart(2, "0")}:${createdTime.getMinutes().toString().padStart(2, "0")}`;
  return (
    show && (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Message Information
            </DialogTitle>
            <span>Created : {createdFormatted}</span>
            <span>Sended : {formatDate(delivered)}</span>
            <span>Read : {formatDate(read)}</span>
            <DialogClose
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return "Not available";

  const date = new Date(dateString);
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");

  return `${hour}:${minute}`;
}
