import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { IMessage, useMessageStore } from "@/hooks/chat-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Id } from "../../../../convex/_generated/dataModel";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  id: any;
  storageId?: Id<"_storage">;
  message: IMessage;
  fromMe: boolean;
}

export default function MessageMoreButton({
  id,
  message,
  storageId,
  fromMe,
}: Props) {
  const deleteMessages = useMutation(api.Messages.deleteMessages);
  const [show, setShow] = useState<boolean>(false);
  const { toast } = useToast();
  const me = useQuery(api.users.getMe);
  const favorite = useMutation(api.bookmarks.createFavorite);
  const BookMarks = useMutation(api.bookmarks.createBookMarks);
  const { clearSelectedMessage, selectedMessages, setSelectedMessages } =
    useMessageStore();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <ChevronDown className="text-gray-200" size={15} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-green-chat ">
          {fromMe && (
            <>
              <DropdownMenuItem
                className="z-10 hover:bg-green-primary border-2 border-green-primary"
                onClick={() => setShow(true)}
              >
                <span className="flex items-center w-full">Info</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await deleteMessages({ id, storage_id: storageId });
                }}
                className="z-10 hover:bg-green-primary border-2 border-green-primary"
              >
                <span className="flex items-center w-full">Delete</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem
            onClick={() => setSelectedMessages(message)}
            className="z-10 hover:bg-green-primary border-2 border-green-primary"
          >
            <span className="flex items-center w-full">Reply</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              try {
                await favorite({
                  message: message._id,
                  userId: me?._id!,
                });
              } catch (error) {
                toast({
                  description: "Can't Be Favorite",
                });
              }
            }}
            className="z-10 hover:bg-green-primary border-2 border-green-primary"
          >
            <span className="flex items-center w-full">Favorite</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              try {
                await BookMarks({
                  message: message._id,
                  userId: me?._id!,
                });
              } catch (error) {
                toast({
                  description: "Can't Be Saved",
                });
              }
            }}
            className="z-10 hover:bg-green-primary border-2 border-green-primary"
          >
            <span className="flex items-center w-full">Pin</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {show && (
        <InfoMessage
          onClose={() => setShow(!show)}
          show={show}
          delivered={message.delivered}
          read={message.read}
          created_at={message._creationTime}
          delivered_at={message.delivered_At}
          read_at={message.read_At}
        />
      )}
    </>
  );
}
interface PropsInfo {
  onClose: () => void;
  show: boolean;
  created_at: number;
  delivered: boolean;
  read: boolean;
  delivered_at: string | undefined;
  read_at: string | undefined;
}

function InfoMessage({
  onClose,
  show,
  created_at,
  delivered,
  read,
  delivered_at,
  read_at,
}: PropsInfo) {
  const createdTime = new Date(created_at);
  const createdFormatted = `${createdTime.getHours().toString().padStart(2, "0")}:${createdTime.getMinutes().toString().padStart(2, "0")}`;

  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    show && (
      <Dialog open={show} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Message Information
            </DialogTitle>
            <span>Created: {createdFormatted}</span>
            {delivered && (
              <span>Delivered: {delivered && formatDate(delivered_at)}</span>
            )}
            {read && <span>Read: {formatDate(read_at)}</span>}
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
