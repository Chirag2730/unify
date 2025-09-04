
import { useState, useEffect } from "react";
import { ShipWheelIcon } from "lucide-react";

const OTPVerification = ({ 
  email, 
  userId, 
  onVerifyOTP, 
  onResendOTP, 
  isPending, 
  error
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length === 6 && userId) {
      if (typeof onVerifyOTP === 'function') {
        // Send userId and otp as backend expects
        onVerifyOTP({ userId, otp: otpString });
      } else {
        console.error("onVerifyOTP is not a function:", onVerifyOTP);
      }
    } else {
      console.log("Invalid submission:", { otpLength: otpString.length, userId });
    }
  };

  const handleResend = () => {
    if (typeof onResendOTP === 'function' && userId) {
      // Send userId as backend expects
      onResendOTP({ userId });
      setTimeLeft(600);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } else {
      console.error("Cannot resend OTP:", { onResendOTP: typeof onResendOTP, userId });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-4xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* OTP VERIFICATION FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Unify
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{typeof error === 'string' ? error : error.response?.data?.message || "An error occurred"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Verify Your Email</h2>
                  <p className="text-sm opacity-70">
                    We've sent a 6-digit verification code to
                  </p>
                  <p className="text-sm font-medium text-primary">{email}</p>
                </div>

                {/* OTP INPUT */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center px-3 gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl border border-primary/25 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ))}
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isPending || otp.join("").length !== 6 || !userId}
                  className="btn btn-primary w-full py-3 font-semibold"
                >
                  {isPending ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Verify Email"
                  )}
                </button>

                {/* RESEND OTP */}
                <div className="text-center">
                  <p className="text-sm opacity-70">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={!canResend || isPending || !userId}
                      className={`font-medium ${canResend && !isPending && userId ? 'text-primary hover:underline' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      Resend Code
                    </button>
                    {timeLeft < 600 && (
                      <span className="ml-2 text-sm opacity-70">
                        ({formatTime(timeLeft)})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE - ILLUSTRATION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/vidcall.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Secure & Reliable</h2>
              <p className="opacity-70">
                Your account security is our priority. Verify your email to complete the registration process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
