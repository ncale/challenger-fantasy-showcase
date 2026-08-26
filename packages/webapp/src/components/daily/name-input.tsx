import { Pencil } from "lucide-react";

type NameInputProps = {
  submissionName: string;
  setSubmissionName: (submissionName: string) => void;
  clearSelection: () => void;
};

export function NameInput({ submissionName, setSubmissionName, clearSelection }: NameInputProps) {
  return (
    <div className="relative gap-2 h-8 pl-10 pr-3">
      <input
        value={submissionName}
        onChange={(e) => setSubmissionName(e.target.value)}
        className="w-full h-8 bg-transparent outline-none font-semibold"
        onFocus={clearSelection}
        aria-label="Submission name"
      />
      <Pencil className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}
