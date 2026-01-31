import { useState } from "react";
import ProgressSteps from "../ProgressSteps";
import { Button } from "@/components/ui/button";

export default function ProgressStepsExample() {
  const [currentStep, setCurrentStep] = useState(2);

  const steps = ["Service", "Schedule", "Team", "Budget", "Confirm"];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <ProgressSteps currentStep={currentStep} totalSteps={5} steps={steps} />
      <div className="flex gap-2 justify-center mt-6">
        <Button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          variant="outline"
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
          disabled={currentStep === 5}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
