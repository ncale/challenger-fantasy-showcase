import { createApiClient } from "@challenger-fantasy/worker/api-client";
import { envClient } from "./env-client";

export const apiClient = createApiClient(envClient.VITE_API_URL);
