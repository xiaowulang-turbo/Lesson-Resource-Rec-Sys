import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { login as loginApi } from "../../services/apiAuth";
import { useNavigate } from "react-router-dom";

export default function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: login, isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),

    onSuccess: (user) => {
      // user is an object which contains the user data and session token
      toast.success("Login successful");
      queryClient.setQueryData(["user"], user?.user);
      navigate("/dashboard", { replace: true });
    },

    onError: (error) => {
      console.log("ERROR", error);
      toast.error("Provide email or password are incorrect");
    },
  });

  return { login, isLoading };
}
