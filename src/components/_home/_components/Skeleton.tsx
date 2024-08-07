import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonDemo() {
  return (
    <div className="flex flex-col w-full h-full space-y-4 p-4">
      <SkeletonChat fromMe={false} />
      <SkeletonChat fromMe={true} />
      <SkeletonChat fromMe={false} />
      <SkeletonChat fromMe={true} />
    </div>
  );
}

function SkeletonChat({ fromMe }: { fromMe: boolean }) {
  return (
    <div
      className={`flex ${fromMe ? "flex-row-reverse" : "flex-row"} items-start space-x-4 bg-green-chat p-4 rounded-xl`}
    >
      <Skeleton className="h-12 w-12 rounded-full" />

      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
