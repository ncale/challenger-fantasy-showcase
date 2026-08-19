import type { UserSubmissionEventDto } from "@challenger-fantasy/schemas";
import type { UserSubmissionEventModel } from "@challenger-fantasy/types";

export const mapUserSubmissionEventToDto = (
  model: UserSubmissionEventModel,
): UserSubmissionEventDto => ({
  event: {
    id: model.event.id,
    name: model.event.name,
    seriesName: model.event.seriesName,
    headlineName: model.event.headlineName,
    slug: model.event.slug,
    eventDate: model.event.eventDate,
    status: model.event.status,
  },
  submissionCount: model.submissionCount,
});
