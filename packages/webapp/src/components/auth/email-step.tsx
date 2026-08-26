import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { sendOtpFn } from "~/lib/server-fns";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type EmailStepProps = {
  referralCode?: string;
  onSuccess: (email: string) => void;
};

export function EmailStep({ referralCode, onSuccess }: EmailStepProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: sendOtpFn,
    onSuccess: (result) => {
      if (result.error) {
        form.setError("email", { message: result.message });
        return;
      }
      onSuccess(form.getValues("email"));
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate({ data: { email: data.email, referralCode } });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. yourname@gmail.com"
                  className="h-12"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  disabled={mutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending code..." : "Continue"}
        </Button>

        {mutation.isError && (
          <p className="mt-2 text-sm text-error">
            {mutation.error?.message || "Something went wrong. Please try again."}
          </p>
        )}
      </form>
    </Form>
  );
}
