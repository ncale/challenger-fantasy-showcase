import type { SubmissionDto } from "../schemas";
import type { UserSubmissionModel } from "../types";

export const mapUserSubmissionToDto = (model: UserSubmissionModel): SubmissionDto => ({
  id: model.id,
  name: model.name ?? undefined,
  scoring: {
    score: model.scoring.score,
    position: model.scoring.position ?? 0,
  },
  game: {
    id: model.game.id,
    name: model.game.name,
  },
  event: {
    id: model.event.id,
    name: model.event.name,
    shortName: model.event.shortName ?? undefined,
  },
});
