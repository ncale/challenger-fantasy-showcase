import { Card, CardHeader } from "../Cards/Card";
import { Skeleton } from "../LoadingUI/Skeleton";

export function LoadingPage2() {
  return (
    <div className="page-container">
      <div className="space-y-page-gap">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
