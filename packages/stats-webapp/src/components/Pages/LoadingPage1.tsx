import { Card, CardContent, CardHeader } from "../Cards/Card";
import { Skeleton } from "../LoadingUI/Skeleton";

export function LoadingPage1() {
  return (
    <div className="page-container">
      <div className="space-y-page-gap">
        <Skeleton className="h-8 w-64" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  );
}
