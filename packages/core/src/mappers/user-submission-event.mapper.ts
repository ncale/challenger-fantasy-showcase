import { parseFullEventName } from "@challenger-fantasy/shared";
import type { Database, UserSubmissionEventModel } from "@challenger-fantasy/types";

type ViewRow = Database["api"]["Views"]["user_submission_events_view"]["Row"];

export const mapUserSubmissionEvent = (row: ViewRow): UserSubmissionEventModel => {
  const { seriesName, headlineName } = parseFullEventName(row.event_name);
  return {
    event: {
      id: row.event_id,
      name: row.event_name,
      seriesName,
      headlineName,
      slug: row.event_slug,
      eventDate: row.event_date,
      status: row.event_status,
    },
    submissionCount: row.submission_count,
  };
};
