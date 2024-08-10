import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon, MessageSquareDiff } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Footer } from "./Footer";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConversationStore } from "@/hooks/chat-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

const UserListDialog = () => {
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [renderedImage, setRenderedImage] = useState("");
  const me = useQuery(api.users.getMe);
  const imgRef = useRef<HTMLInputElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const users = useQuery(api.users.getUsers);
  const { push } = useRouter();

  const createConversation = useMutation(api.conversations.createConversation);
  const generateUploadUrl = useMutation(api.conversations.generateUploadUrl);

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;
    setIsLoading(true);
    try {
      const isGroup = selectedUsers.length > 1;

      let conversationId;
      if (!isGroup) {
        conversationId = await createConversation({
          participants: [...selectedUsers, me?._id!],
          isGroup: false,
        });
      } else {
        const postUrl = await generateUploadUrl();

        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage?.type! },
          body: selectedImage,
        });

        const { storageId } = await result.json();

        conversationId = await createConversation({
          participants: [...selectedUsers, me?._id!],
          isGroup: true,
          admin: me?._id!,
          groupName,
          groupImage: storageId,
        });
      }

      dialogCloseRef.current?.click();
      setSelectedUsers([]);
      setGroupName("");
      setSelectedImage(null);

      const conversationName = isGroup
        ? groupName
        : users?.find((user) => user._id === selectedUsers[0])?.name;
      push(`?q=${conversationId}`);
    } catch (err) {
      toast({
        description: "Something Went Wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { setSelectedConversation } = useConversationStore();

  useEffect(() => {
    if (!selectedImage) return setRenderedImage("");
    const reader = new FileReader();
    reader.onload = (e) => setRenderedImage(e.target?.result as string);
    reader.readAsDataURL(selectedImage);
  }, [selectedImage]);

  const handleUserClick = useCallback(
    (userId: Id<"users">) => {
      if (selectedUsers.includes(userId)) {
        setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      } else {
        setSelectedUsers([...selectedUsers, userId]);
      }
    },
    [selectedUsers]
  );
  const handleCancel = useCallback(() => {
    setSelectedUsers([]);
    setGroupName("");
    setSelectedImage(null);
    dialogCloseRef.current?.click(); // Close the dialog
  }, [setSelectedUsers, setGroupName, setSelectedImage, dialogCloseRef]);
  return (
    <Dialog>
      <DialogTrigger>
        <MessageSquareDiff size={20} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogClose ref={dialogCloseRef} />
          <DialogTitle>USERS</DialogTitle>
        </DialogHeader>
        <DialogDescription>Start a new chat</DialogDescription>
        {renderedImage && (
          <div className="w-16 h-16 relative mx-auto">
            <Image
              src={renderedImage}
              fill
              alt="user image"
              className="rounded-full object-cover"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={imgRef}
          hidden
          onChange={(e) => setSelectedImage(e.target.files![0])}
        />
        {selectedUsers.length > 1 && (
          <>
            <Input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button
              className="flex gap-2"
              onClick={() => imgRef.current?.click()}
            >
              <ImageIcon size={20} />
              Group Image
            </Button>
          </>
        )}
        <div className="flex flex-col gap-3 overflow-auto max-h-60">
          {users?.map((user) => {
            return (
              <div
                key={user._id}
                className={`flex gap-3 items-center p-2 rounded cursor-pointer active:scale-95 
								transition-all ease-in-out duration-300
							${selectedUsers.includes(user._id) ? "bg-green-primary" : ""}`}
                onClick={() => handleUserClick(user._id)}
              >
                <Avatar className="overflow-visible">
                  {user.isOnline && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground" />
                  )}

                  <AvatarImage
                    src={user.image}
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback>
                    <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
                  </AvatarFallback>
                </Avatar>

                <div className="w-full ">
                  <div className="flex items-center justify-between">
                    <p className="text-md font-medium">
                      {user.name || user.email.split("@")[0]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Footer
          onCancel={handleCancel}
          onClick={handleCreateConversation}
          groupName={groupName}
          isLoading={isLoading}
          selectedUsers={selectedUsers}
        />
      </DialogContent>
    </Dialog>
  );
};
export default UserListDialog;
