import type {
  DBClient,
  PagePaginationOptions,
  SubmissionStatusOptions,
} from "../../types";
import { mapUserSubmissionEvent } from "../mappers/user-submission-event.mapper";

const EVENT_STATUS_MAP = {
  live: "live",
  upcoming: "scheduled",
  completed: "final",
} as const satisfies Record<SubmissionStatusOptions["status"], string>;

type GetByUserIdOptions = {
  status?: SubmissionStatusOptions["status"];
} & PagePaginationOptions;

class UserSubmissionEventRepository {
  private supabase: DBClient;
  constructor(supabase: DBClient) {
    this.supabase = supabase;
  }

  async getByUserId(
    userId: string,
    { status = "completed", page = 0, pageSize = 10 }: GetByUserIdOptions = {},
  ) {
    const { data, error, count } = await this.supabase
      .schema("api")
      .from("user_submission_events_view")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("event_status", EVENT_STATUS_MAP[status])
      .order("event_date", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    return { items: data.map(mapUserSubmissionEvent), total: count ?? 0 };
  }
}

export function createUserSubmissionEventRepository(
  supabase: DBClient,
): UserSubmissionEventRepository {
  return new UserSubmissionEventRepository(supabase);
}

export type { UserSubmissionEventRepository };
