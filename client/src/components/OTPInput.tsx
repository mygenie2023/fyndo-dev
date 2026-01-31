import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
}

export default function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [value, setValue] = useState("");

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (newValue.length === length) {
      onComplete?.(newValue);
    }
  };

  return (
    <div className="flex justify-center" data-testid="otp-input">
      <InputOTP maxLength={length} value={value} onChange={handleChange}>
        <InputOTPGroup>
          {Array.from({ length }).map((_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
