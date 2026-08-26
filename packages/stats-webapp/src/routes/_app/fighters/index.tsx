import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { DefaultAvatar } from "@/components/Avatars/DefaultAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Cards/Card";
import { fightersQuery } from "@/lib/init-queries";

export const Route = createFileRoute("/_app/fighters/")({
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(fightersQuery({ kind: "popular" }));
  },
  pendingComponent: () => <div>Loading fighters page...</div>,
  component: FightersPage,
});

const FighterRow = ({ fighter }: { fighter: { id: string; slug: string; name: string } }) => {
  return (
    <Link
      to="/fighters/$fighterIdOrSlug"
      params={{ fighterIdOrSlug: fighter.slug }}
      className="block py-3 px-2 hover:bg-accent transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <DefaultAvatar text={fighter.name} size="sm" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground hover:text-accent-foreground transition-colors">
            {fighter.name}
          </div>
          {/* <div className="text-xs text-muted-foreground">
            {getAge(fighter.dob, 0)} years old
          </div> */}
        </div>
      </div>
    </Link>
  );
};

function FightersPage() {
  const { data } = useSuspenseQuery(fightersQuery({ kind: "popular" }));

  return (
    <div className="page-container">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
              <Trophy className="size-4 text-yellow-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">Popular Fighters</div>
              <div className="text-sm text-muted-foreground font-normal">
                Elite popular fighters in the UFC
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {data.map((fighter) => (
              <FighterRow key={fighter.id} fighter={fighter} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
