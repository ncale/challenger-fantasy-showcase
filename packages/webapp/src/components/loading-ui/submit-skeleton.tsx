import { Skeleton } from "../ui/skeleton";

export function SubmitSkeleton() {
  return (
    <div className={"absolute inset-0 flex flex-col gap-y-2 border-border"}>
      {Array.from({ length: 5 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <there is no need to have a unique key since there is no content>
        <Skeleton key={`slot-${index}`} className="h-4 w-full" />
      ))}
    </div>
  );
}
