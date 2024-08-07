import { Button } from "@/components/ui/button";
interface Props {
  selectedUsers: string[];
  isLoading: boolean;
  groupName: string;
  onClick: () => void;
}
export const Footer = ({
  selectedUsers,
  isLoading,
  groupName,
  onClick,
}: Props) => {
  return (
    <div className="flex justify-between">
      <Button variant={"outline"}>Cancel</Button>
      <Button
        onClick={onClick}
        disabled={
          selectedUsers.length === 0 ||
          (selectedUsers.length > 1 && !groupName) ||
          isLoading
        }
      >
        {/* spinner */}
        {isLoading ? (
          <div className="w-5 h-5 border-t-2 border-b-2  rounded-full animate-spin" />
        ) : (
          "Create"
        )}
      </Button>
    </div>
  );
};
