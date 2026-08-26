import { SUBMISSION_STATUS_MAP } from "@challenger-fantasy/shared";
import type {
  DBClient,
  PagePaginationOptions,
  SubmissionStatusOptions,
} from "@challenger-fantasy/types";
import { mapUserSubmission } from "../mappers/user-submission.mapper";

type GetByUserIdOptions = {
  status?: SubmissionStatusOptions["status"];
  eventId?: string;
} & PagePaginationOptions;

class UserSubmissionRepository {
  private supabase: DBClient;
  constructor(supabase: DBClient) {
    this.supabase = supabase;
  }

  async getByUserId(
    userId: string,
    { status, eventId, page = 0, pageSize = 50 }: GetByUserIdOptions = {},
  ) {
    let query = this.supabase
      .schema("api")
      .from("daily_mma_game_submissions_view")
      .select("*")
      .eq("user_id", userId);

    if (status) query = query.eq("event_status", SUBMISSION_STATUS_MAP[status]);
    if (eventId) query = query.eq("event_id", eventId);

    const { data, error } = await query
      .order("event_date", { ascending: false })
      .order("position", { ascending: true, nullsFirst: false })
      .order("score", { ascending: false, nullsFirst: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;

    return data.map(mapUserSubmission);
  }
}

export function createUserSubmissionRepository(supabase: DBClient): UserSubmissionRepository {
  return new UserSubmissionRepository(supabase);
}

export type { UserSubmissionRepository };
