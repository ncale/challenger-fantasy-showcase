import { createApiClient } from "@challenger-fantasy/worker/api-client";
import { env } from "./env";

export const apiClient = createApiClient(env.VITE_API_URL);
