import { useMutation } from "@tanstack/react-query";
import { signup as signupApi } from "../../services/apiAuth";
import toast from "react-hot-toast";

export default function useSignup() {
  const { mutate: signup, isLoading } = useMutation({
    mutationFn: signupApi,
    onSuccess: (user) => {
      toast.success("Sign up successfully");
      console.log("Sign up successfully");
      console.log("user", user);
    },

    onError: (error) => {
      console.log("error", error);
    },
  });

  return { signup, isLoading };
}
