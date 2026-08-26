import { createFileRoute } from "@tanstack/react-router";
import { singleEventQuery } from "@/lib/init-queries";

export const Route = createFileRoute("/_app/events/$eventIdOrSlug")({
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(singleEventQuery(params.eventIdOrSlug));
  },
  staticData: {
    getTitle: (loaderData: { name: string }) => loaderData.name,
  },
});
