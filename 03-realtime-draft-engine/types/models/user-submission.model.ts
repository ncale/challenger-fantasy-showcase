export type UserSubmissionModel = {
  id: string;
  name: string | null;
  scoring: {
    score: number;
    position: number | null;
  };
  game: {
    id: string;
    name: string;
  };
  event: {
    id: string;
    name: string;
    shortName: string | null;
    slug: string;
    status: "scheduled" | "live" | "final" | "cancelled";
    date: string;
    startTimeUtc: string;
  };
};
