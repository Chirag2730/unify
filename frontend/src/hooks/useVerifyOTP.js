
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyOTP, resendOTP } from "../lib/api";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: verifyOTPMutation,
    isPending: isVerifying,
    error: verifyError,
  } = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      console.log("✅ OTP verification successful:", data);
      
      // Update the auth user cache
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Show success message
      toast.success("Email verified successfully!");
      
      // Navigate based on onboarding status
      if (data.user?.isOnboarded) {
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    },
    onError: (error) => {
      console.error("❌ OTP verification failed:", error);
      toast.error(error.response?.data?.message || "Invalid verification code");
    },
  });

  const {
    mutate: resendOTPMutation,
    isPending: isResending,
    error: resendError,
  } = useMutation({
    mutationFn: resendOTP,
    onSuccess: () => {
      toast.success("New verification code sent to your email!");
    },
    onError: (error) => {
      console.error("❌ Resend OTP failed:", error);
      toast.error(error.response?.data?.message || "Failed to resend code");
    },
  });

  return { 
    verifyOTPMutation, 
    isVerifying, 
    verifyError,
    resendOTPMutation,
    isResending,
    resendError
  };
};

export default useVerifyOTP;
