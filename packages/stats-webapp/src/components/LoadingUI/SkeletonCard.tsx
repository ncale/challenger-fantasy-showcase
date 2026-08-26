import { Card, CardContent, CardHeader } from "../Cards/Card";
import { Skeleton } from "./Skeleton";

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
