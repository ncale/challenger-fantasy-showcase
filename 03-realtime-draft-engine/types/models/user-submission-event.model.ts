export type UserSubmissionEventModel = {
  event: {
    id: string;
    name: string;
    seriesName: string;
    headlineName: string;
    slug: string;
    eventDate: string;
    status: "scheduled" | "live" | "final" | "cancelled";
  };
  submissionCount: number;
};
