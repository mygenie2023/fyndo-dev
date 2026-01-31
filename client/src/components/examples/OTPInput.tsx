import OTPInput from "../OTPInput";

export default function OTPInputExample() {
  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Enter OTP</h2>
        <p className="text-sm text-muted-foreground mb-6">
          We've sent a 6-digit code to your mobile number
        </p>
        <OTPInput
          length={6}
          onComplete={(otp) => console.log("OTP entered:", otp)}
        />
      </div>
    </div>
  );
}
