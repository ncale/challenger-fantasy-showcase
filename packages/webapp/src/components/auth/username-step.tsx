import { UsernameSchema } from "@challenger-fantasy/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDebounce } from "~/hooks/use-debounce";
import { checkUsernameQuery } from "~/lib/init-queries";
import { setUsernameFn } from "~/lib/server-fns";
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
  username: UsernameSchema,
});

type UsernameStepProps = {
  onSuccess: () => void;
};

export function UsernameStep({ onSuccess }: UsernameStepProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const username = form.watch("username");
  const isUsernameValid = UsernameSchema.safeParse(username).success;
  const debouncedValidUsername = useDebounce(isUsernameValid ? username : "", 500);

  const { data: checkUsernameData, isLoading: isCheckingUsername } = useQuery(
    checkUsernameQuery(debouncedValidUsername),
  );
  const { isAvailable } = checkUsernameData || {};

  const mutation = useMutation({
    mutationFn: setUsernameFn,
    onSuccess: (result) => {
      if (result.error) {
        form.setError("username", { message: result.message });
        return;
      }
      onSuccess();
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isAvailable === false) {
      form.setError("username", { message: "Username is already taken" });
      return;
    }
    mutation.mutate({ data: { username: data.username } });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose your username</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="username"
                    className="h-12 pr-10"
                    autoFocus
                    autoComplete="username"
                    disabled={mutation.isPending}
                    {...field}
                  />

                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isCheckingUsername && (
                      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    )}
                    {isAvailable === true && <CheckCircle2 className="w-5 h-5 text-success" />}
                    {isAvailable === false && <XCircle className="w-5 h-5 text-error" />}
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                {isAvailable === false ? (
                  <span className="text-error">Username is taken</span>
                ) : (
                  "This will be your public @username"
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12"
          disabled={mutation.isPending || isAvailable === false}
        >
          {mutation.isPending ? "Claiming username..." : "Claim username"}
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
