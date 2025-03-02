import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../../services/apiSettings";

export function useSettings() {
  const {
    isLoading,
    error,
    data: settings,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings, // receive a function that returns a promise, or we can say a async function
  });
  return {
    isLoading,
    error,
    settings,
  };
}
