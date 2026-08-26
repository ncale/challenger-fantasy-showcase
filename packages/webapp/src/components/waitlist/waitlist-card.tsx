import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Check, Copy, LogOut, Share2 } from "lucide-react";
import { useState } from "react";
import { logoutFn } from "~/lib/server-fns";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

type WaitlistCardProps = {
  username: string;
  position: number;
  referralBonus: number;
  referralCode: string;
  baseUrl: string;
};

export function WaitlistCard({
  username,
  position,
  referralBonus,
  referralCode,
  baseUrl,
}: WaitlistCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const referralUrl = `${baseUrl}/join?ref=${referralCode}`;

  const { mutate: logout } = useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      router.navigate({ to: "/join" });
    },
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = referralUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Challenger Fantasy",
          text: "Join me on Challenger Fantasy!",
          url: referralUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Username</p>
            <p className="text-lg font-semibold">{username}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Position</p>
            <p className="text-lg font-semibold">#{position}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Referrals</p>
            <p className="text-lg font-semibold">{referralBonus}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <p className="font-medium flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Invite friends
            </p>
            <p className="text-sm text-muted-foreground">Share your referral link</p>
          </div>

          <div className="flex gap-2">
            <Input value={referralUrl} readOnly className="h-10 font-mono text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="h-10 w-10 shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <Button onClick={handleShare} className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share invite link
          </Button>
        </div>

        <Separator />

        <Button variant="outline" size="sm" className="w-full" onClick={() => logout({})}>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </Button>
      </CardContent>
    </Card>
  );
}
