import { cn } from "~/lib/utils";

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div
            key={step}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              isActive && "bg-primary",
              isCompleted && "bg-primary/60",
              !isActive && !isCompleted && "bg-muted",
            )}
          />
        );
      })}
    </div>
  );
}
