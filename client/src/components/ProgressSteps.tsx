import { Check } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
}

export default function ProgressSteps({
  currentStep,
  totalSteps,
  steps,
}: ProgressStepsProps) {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={idx} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`step-${stepNumber}`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                {steps && steps[idx] && (
                  <p className="text-xs mt-2 text-center text-muted-foreground font-medium">
                    {steps[idx]}
                  </p>
                )}
              </div>
              {idx < totalSteps - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded transition-colors ${
                    isCompleted ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground" data-testid="text-step-indicator">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
