import { LINKS } from "@challenger-fantasy/core";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export function WaitlistFooter() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <a href={LINKS.DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
        <Card className="h-full hover:bg-muted/50 transition-colors">
          <CardContent className="py-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Community</p>
                <p className="text-sm text-muted-foreground">Join Discord</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </a>
      <a href={LINKS.SUPPORT} target="_blank" rel="noopener noreferrer">
        <Card className="h-full hover:bg-muted/50 transition-colors">
          <CardContent className="py-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Support</p>
                <p className="text-sm text-muted-foreground">Get help</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </a>
    </div>
  );
}
