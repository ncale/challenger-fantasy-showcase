import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCountdown } from "~/hooks/use-countdown";
import { sendOtpFn, verifyOtpFn } from "~/lib/server-fns";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const formSchema = z.object({
  otp: z
    .string()
    .min(6, { message: "Code must be 6 digits" })
    .max(6, { message: "Code must be 6 digits" })
    .regex(/^\d{6}$/, { message: "Code must be 6 digits" }),
});

type OtpStepProps = {
  email: string;
  referralCode?: string;
  onSuccess: (hasUsername: boolean) => void;
  onBack: () => void;
};

export function OtpStep({ email, referralCode, onSuccess, onBack }: OtpStepProps) {
  const { countdown, startCountdown } = useCountdown();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyOtpFn,
    onSuccess: (result) => {
      if (result.error) {
        form.setError("otp", { message: result.message });
        return;
      }
      onSuccess(result.hasUsername);
    },
  });

  const resendMutation = useMutation({
    mutationFn: sendOtpFn,
    onSuccess: (result) => {
      if (!result.error) {
        startCountdown(60);
      }
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    verifyMutation.mutate({ data: { email, token: data.otp } });
  };

  const handleResend = () => {
    if (countdown > 0) return;
    resendMutation.mutate({ data: { email, referralCode } });
  };

  return (
    <div className="w-full space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="000000"
                    className="h-12 text-center text-lg tracking-[0.5em] font-mono"
                    maxLength={6}
                    autoFocus
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    disabled={verifyMutation.isPending}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  We sent a 6-digit code to <span className="font-medium">{email}</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-12" disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? "Verifying..." : "Verify"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resendMutation.isPending}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendMutation.isPending
                ? "Sending..."
                : countdown > 0
                  ? `Resend code in ${countdown}s`
                  : "Resend code"}
            </button>
          </div>

          {verifyMutation.isError && (
            <p className="mt-2 text-sm text-error">
              {verifyMutation.error?.message || "Something went wrong. Please try again."}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
