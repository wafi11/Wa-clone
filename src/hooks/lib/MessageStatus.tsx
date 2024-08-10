import { Check, CheckCheck, Clock } from "lucide-react"; // Import different icons

interface Props {
  delivered?: boolean;
  read?: boolean;
  isOnline?: boolean;
}

export default function MessageStatus({ delivered, read, isOnline }: Props) {
  if (delivered && read) {
    return <CheckCheck className="text-blue-600 size-4" />;
  } else if (delivered) {
    return <CheckCheck className="text-gray-500 size-4" />;
  } else if (isOnline) {
    return <Check className="text-gray-400  size-4" />;
  } else {
    return <Clock className="text-gray-400  size-4" />;
  }
}
