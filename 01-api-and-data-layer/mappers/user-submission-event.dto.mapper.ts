import type { UserSubmissionEventDto } from "../schemas";
import type { UserSubmissionEventModel } from "../types";

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
