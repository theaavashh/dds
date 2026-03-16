import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/apiQueries';
import toast from 'react-hot-toast';

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: () => {
      toast.success('Login successful');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast.success('Logged out successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.sendOtp(email),
    onSuccess: () => {
      toast.success('OTP sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyOtp(email, otp),
    onSuccess: () => {
      toast.success('OTP verified successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};