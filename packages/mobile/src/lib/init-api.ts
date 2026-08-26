import { createApiClient } from "@challenger-fantasy/worker/api-client";
import { env } from "~/lib/env";

export const apiClient = createApiClient(env.EXPO_PUBLIC_API_URL);
